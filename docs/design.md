# تصميم نظام مقرأة إلكترونية لتعليم القرآن الكريم

هذا المستند يوضح بنية قاعدة البيانات المقترحة وبعض الملاحظات البرمجية لنظام مقرأة إلكترونية باستخدام PHP وMySQL وواجهات HTML مع Tailwind CSS. يعتمد النظام على الأدوار التالية:

1. **المدير**
2. **المشرف**
3. **المعلم**
4. **الطالب**

## قاعدة البيانات

### الجداول الموجودة

- `quran_verses` – تخزين الآيات.
- `quran_words` – الكلمات التابعة لكل آية.
- `quran_chars` – الحروف والتشكيل.

### الجداول المقترحة

```sql
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `role_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- علاقة المشرفين بالمعلمين
CREATE TABLE `supervisor_teacher` (
  `supervisor_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  PRIMARY KEY (`supervisor_id`, `teacher_id`),
  FOREIGN KEY (`supervisor_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- علاقة المعلمين بالطلاب
CREATE TABLE `teacher_student` (
  `teacher_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  PRIMARY KEY (`teacher_id`, `student_id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- تسجيل تلاوات الطلاب
CREATE TABLE `recitations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `teacher_id` INT DEFAULT NULL,
  `start_page` INT NOT NULL,
  `end_page` INT NOT NULL,
  `audio_path` VARCHAR(255) NOT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- أخطاء أو ملاحظات المعلم على التلاوة
CREATE TABLE `recitation_feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `recitation_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  `verse_id` INT NOT NULL,
  `word_position` INT DEFAULT NULL,
  `char_position` INT DEFAULT NULL,
  `error_type` VARCHAR(50) DEFAULT NULL,
  `comment_text` TEXT,
  `audio_comment` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`recitation_id`) REFERENCES `recitations`(`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`verse_id`) REFERENCES `quran_verses`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- الرسائل بين المستخدمين
CREATE TABLE `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `message_text` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

يمكن إضافة جداول إحصائيات أو تقارير لاحقًا بحسب الحاجة.

## الهيكل البرمجي المختصر

يُفضّل أن تكون الصفحات بسيطة بحيث يتم تضمين ملفات PHP مباشرة بدون استخدام نمط MVC. يمكن استخدام ملفات منفصلة للاتصال بقاعدة البيانات وملفات للوظائف العامة.

```
index.php         -- الصفحة الرئيسية / تسجيل الدخول
admin.php         -- لوحة تحكم المدير
supervisor.php    -- لوحة تحكم المشرف
teacher.php       -- لوحة تحكم المعلم
student.php       -- لوحة الطالب لتسجيل التلاوة
functions.php     -- دوال مساعدة (الاتصال بقاعدة البيانات، التحقق من الصلاحيات، ...)
```

## المظهر العام

- استخدام [Tailwind CSS](https://cdn.tailwindcss.com) مع تخصيص الألوان لتدرجات البني والذهبي.
- اعتماد خط "Tajawal" من Google Fonts.
- استعمال أيقونات مناسبة مثل [Heroicons](https://heroicons.com/).

يرجى الانتباه إلى أن تضمين المكتبات الخارجية يستلزم وجود اتصال بالشبكة عند تشغيل النظام.
