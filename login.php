<?php
// نموذج تسجيل الدخول
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تسجيل الدخول</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Tajawal', sans-serif; }
  </style>
</head>
<body class="bg-gradient-to-b from-amber-50 to-yellow-100 min-h-screen flex items-center justify-center">
  <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm" method="post" action="login.php">
    <h2 class="mb-6 text-center text-xl font-bold text-amber-700">تسجيل الدخول</h2>
    <div class="mb-4">
      <label class="block text-amber-700 mb-2" for="username">اسم المستخدم</label>
      <input class="shadow appearance-none border rounded w-full py-2 px-3" id="username" name="username" type="text" required>
    </div>
    <div class="mb-6">
      <label class="block text-amber-700 mb-2" for="password">كلمة المرور</label>
      <input class="shadow appearance-none border rounded w-full py-2 px-3" id="password" name="password" type="password" required>
    </div>
    <div class="flex items-center justify-between">
      <button class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded" type="submit">دخول</button>
    </div>
  </form>
</body>
</html>
