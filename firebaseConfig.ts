import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// --- HƯỚNG DẪN CẤU HÌNH ---
// 1. Truy cập https://console.firebase.google.com/
// 2. Tạo dự án mới.
// 3. Vào mục "Realtime Database" -> Tạo Database -> Chọn chế độ Test Mode (để test) hoặc Locked Mode (cần set rules).
// 4. Vào mục Project Settings (bánh răng) -> General -> Cuộn xuống SDK setup and configuration -> Chọn CDN.
// 5. Copy các thông tin trong firebaseConfig dán vào dưới đây:

const firebaseConfig = {
  apiKey: "AIzaSyD-YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export database reference
export const db = getDatabase(app);
