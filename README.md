# Mezorn даалгавар прожект 

## Датабааз эхлүүлэх
Датабаазын хэрэглэгчийн мэдээлэл 
 - username: admin
 - password: password
<br>
<br> Датабааз асах порт: 27017
<br>
```
docker-compose up -d
```

## Тохиргооны файл үүсгэх
.env файл доторх <br>
AWS хэрэглэгч үүсгэх хэрэгтэй ба хэрэглэгч нь дараах "Permissions policies"-той байх хэрэгтэй<br>
 - AmazonS3FullAccess
 - AmazonTextractFullAccess
 - AmazonRekognitionFullAccess

Мөн .env файл дотор AWS_ өргөтгөлтэй талбаруудад шаардлагатай мэдээллүүдийг оруулах ёстой
```
cp .env.example .env
```

## Прожект шаардлагатай сангуудыг суулгах
```
npm install
```

## Прожект эхлүүлэх
```
npm run start
```