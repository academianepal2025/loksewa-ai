import { createAdminClient } from './lib/supabase/admin';
import fs from 'fs';
import path from 'path';

async function uploadQR() {
  const supabase = createAdminClient();
  const filePath = 'C:/Users/HP/.gemini/antigravity/brain/823da753-8785-4231-9e27-4f90eb816c63/media__1777894865346.jpg';
  
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  const fileBuffer = fs.readFileSync(filePath);

  // 1. Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.name === 'system')) {
    await supabase.storage.createBucket('system', { public: true });
    console.log('Created bucket: system');
  }

  // 2. Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('system')
    .upload('esewa_qr.jpg', fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return;
  }

  // 3. Get public URL
  const { data: urlData } = supabase.storage
    .from('system')
    .getPublicUrl('esewa_qr.jpg');

  const publicUrl = urlData.publicUrl;
  console.log('Public URL:', publicUrl);

  // 4. Update app_settings table
  const { error: dbError } = await supabase
    .from('app_settings')
    .upsert({ key: 'payment_qr_url', value: publicUrl, description: 'eSewa QR Code' });

  if (dbError) {
    console.error('DB Error:', dbError);
  } else {
    console.log('Database updated successfully with QR URL.');
  }
}

uploadQR();
