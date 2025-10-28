import { createClient } from '@supabase/supabase-js'; import fs from 'fs'; import path from 'path'; 
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); 
export default async function handler(req,res){ if(req.method!=='POST') return res.status(405).end(); 
    const { sourceImage } = req.body; const authHeader = req.headers.authorization || ''; 
    const token = authHeader.replace('Bearer ',''); if(!token) return res.status(401).json({ error: 'Unauthorized' }); 
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token); 
    if(userErr || !userData?.user) return res.status(401).json({ error: 'Invalid token' }); 
    const userId = userData.user.id; try{ const imgPath = path.join(process.cwd(),'public','images', sourceImage); 
    const fileBuffer = fs.readFileSync(imgPath); const fileName = `win.png`; 
    const { data, error } = await supabaseAdmin.storage.from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET).upload(`${userId}/${fileName}`, fileBuffer, { upsert: true }); 
    if(error) return res.status(500).json({ error: error.message }); 
    const { data: urlData, error: urlErr } = await supabaseAdmin.storage.from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET).createSignedUrl(`${userId}/${fileName}`, 60); 
    if(urlErr) return res.status(500).json({ error: urlErr.message }); 
    await supabaseAdmin.from('user_game_results').upsert({ user_id: userId, image_url: urlData.signedUrl }, { onConflict: 'user_id' }); return res.status(200).json({ url: urlData.signedUrl }); }catch(e){ console.error(e); return res.status(500).json({ error: 'Server error' }); } }
