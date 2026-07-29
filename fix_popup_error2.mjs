import fs from 'fs';
let content = fs.readFileSync('src/components/MarketAnalysisPopup.tsx', 'utf8');

const target = `      if (!response.ok) {
        throw new Error('Failed to fetch market analysis');
      }

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء تحميل بيانات السوق');
      onClose();
    } finally {`;

const replacement = `      if (!response.ok) {
        let errMsg = 'فشل في جلب البيانات';
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }
      const result = await response.json();
      setData(result);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'حدث خطأ أثناء تحميل بيانات السوق');
      onClose();
    } finally {`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/MarketAnalysisPopup.tsx', content);
