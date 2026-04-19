import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure master admin always has admin role in profile
            if (u.email === "dalinadjib1990@gmail.com" && data.role !== 'admin') {
              await updateDoc(docRef, { role: 'admin' });
              setProfile({ ...data, role: 'admin' } as UserProfile);
            } else {
              setProfile(data as UserProfile);
            }
          } else {
            // Create a basic profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              firstName: u.displayName?.split(' ')[0] || '',
              lastName: u.displayName?.split(' ').slice(1).join(' ') || '',
              wilaya: 'الجزائر',
              phone: '',
              photoURL: u.photoURL || '',
              role: u.email === "dalinadjib1990@gmail.com" ? 'admin' : 'user',
              createdAt: serverTimestamp(),
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}
