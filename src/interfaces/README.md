# Interfaces & Veri Modelleri

Bu klasör, WatchMatch uygulamasında kullanılan veri yapılarını ve modellerini dokümante etmektedir. JavaScript projelerinde TypeScript tipleri veya arayüzleri derleme anında zorunlu olmasa da, veri bütünlüğünü korumak ve geliştiricilere yol göstermek amacıyla veri şemaları aşağıda tanımlanmıştır.

## Movie (Film) Modeli Şeması

Uygulamadaki her film veya dizi nesnesi aşağıdaki alanlara sahip olmalıdır:

```typescript
interface Movie {
  id: string;          // Benzersiz kimlik (örn: "tmdb_123" veya "162351239")
  title: string;       // Film veya dizi adı
  genre: string;       // Birincil türü (örn: "Aksiyon", "Komedi", "Dram")
  rating: number;      // IMDb veya TMDb Puanı (örn: 8.2)
  note: string;        // Film özeti veya açıklama
  platforms: string[]; // Yayınlandığı platformlar (örn: ["Netflix", "Disney+"])
  duration: number;    // Süre (dakika cinsinden)
  language: string;    // Dil (örn: "Türkçe", "İngilizce")
  poster: string;      // Afiş resminin görsel URL'si
  trailer: string;     // Fragman URL'si (örn: YouTube linki)
}
```

## Room (Oda) Modeli Şeması

Çok oyunculu (Lobi/Eşleşme) özelliğinde kullanılan oda yapısı:

```typescript
interface Room {
  id: string;          // 6 haneli oda kodu (örn: "WM429F")
  name: string;        // Oda adı (varsayılan: "Oda #ID")
  createdAt: number;   // Oluşturulma zamanı (timestamp)
  hostId: string;      // Odayı kuran kullanıcının Firebase uid değeri
  status: 'lobby' | 'swiper' | 'results'; // Odanın o anki durumu
  filters: {
    genres: string[];    // Seçilen film türleri filtresi
    platforms: string[]; // Seçilen platform filtreleri
    minRating: number;   // Minimum puan limiti
    maxDuration: number; // Maksimum süre limiti
    language: string;    // Dil filtresi
  };
}
```
