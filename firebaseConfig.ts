import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// --- HƯỚNG DẪN CẤU HÌNH ---
// 1. Truy cập https://console.firebase.google.com/
// 2. Tạo dự án mới.
// 3. Vào mục "Realtime Database" -> Tạo Database -> Chọn chế độ Test Mode (để test) hoặc Locked Mode (cần set rules).
// 4. Vào mục Project Settings (bánh răng) -> General -> Cuộn xuống SDK setup and configuration -> Chọn CDN.
// 5. Copy các thông tin trong firebaseConfig dán vào dưới đây:

const firebaseConfig = {
    apiKey: "AIzaSyDPSVMuiiHb3RnpfK78KACYcSUoopqB7RY",
    authDomain: "vmedia-8b817.firebaseapp.com",
    databaseURL: "https://vmedia-8b817-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "vmedia-8b817",
    storageBucket: "vmedia-8b817.firebasestorage.app",
    messagingSenderId: "165938875040",
    appId: "1:165938875040:web:38d1dd36cf9e32bef797c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export database reference
export const db = getDatabase(app);
