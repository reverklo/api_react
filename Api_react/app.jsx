/**
 * ============================================================================
 * Movie World 🎬 (มูฟวี่ เวิลด์)
 * แอปพลิเคชันค้นหาภาพยนตร์และซีรีส์ระดับโลกด้วย React 18 & TVmaze API
 * ดีไซน์โทนสีอบอุ่น ดูสบายตา (Warm Cozy Cinema Aesthetic)
 * 
 * คุณสมบัติตรงตามเกณฑ์ใบงาน:
 * 1. Form + State: มี label, เก็บค่าคำค้นด้วย React useState
 * 2. Search & Enter: ค้นหาได้ทั้งคลิกปุ่มหรือกด Enter หน้าไม่รีโหลด (e.preventDefault())
 * 3. Validation: ใช้ trim() ตรวจค่าว่าง และแสดงข้อความเตือน
 * 4. API & URLSearchParams: ใช้ fetch + async/await และ new URLSearchParams({ q })
 * 5. Display: ชื่อ รูปภาพ เรตติ้ง แนวซีรีส์ ปีฉาย สถานะ เรื่องย่อ
 * 6. 4 States ครบถ้วน: Loading / Success / Empty / Error (พร้อมปุ่ม Retry)
 * 7. ป้องกัน Submit ซ้ำ: ปิดปุ่มค้นหาขณะโหลด (disabled while loading)
 * 8. Fallback: รองรับข้อมูลไม่ครบถ้วน และมีรูปภาพสำรองเมื่อไม่มีโปสเตอร์
 * 9. User Journey: 5 ขั้นตอน (กรอกคำค้น -> ค้นหา -> รอผล -> ดูผล -> ค้นใหม่)
 * 10. แถบหนังแนะนำ (Recommended Shows Bar) + หนังหน้าหลัก (Home Showcase)
 * ============================================================================
 */

const { useState, useEffect, useCallback, useMemo, useRef } = React;

// --- คลังข้อมูลซีรีส์แนะนำระดับโลก (Curated Fallback Masterpieces) ---
const CURATED_DEFAULT_SHOWS = [
  {
    score: 1.0,
    show: {
      id: 169,
      name: "Breaking Bad",
      type: "Scripted",
      language: "English",
      genres: ["Drama", "Crime", "Thriller"],
      status: "Ended",
      runtime: 60,
      premiered: "2008-01-20",
      ended: "2013-09-29",
      rating: { average: 9.2 },
      network: { name: "AMC", country: { name: "United States", code: "US" } },
      officialSite: "http://www.amc.com/shows/breaking-bad",
      url: "https://www.tvmaze.com/shows/169/breaking-bad",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg"
      },
      summary: "<p><b>Breaking Bad</b> ติดตามชีวิตของ Walter White ครูสอนเคมีมัธยมปลายผู้ถูกวินิจฉัยว่าเป็นมะเร็งปอดระยะสุดท้าย เขาจึงหันมาร่วมมือกับอดีตลูกศิษย์ Jesse Pinkman ในการผลิตและค้ายาไอซ์บริสุทธิ์เพื่อหาเงินทิ้งไว้ให้ครอบครัว</p>"
    }
  },
  {
    score: 0.98,
    show: {
      id: 2993,
      name: "Stranger Things",
      type: "Scripted",
      language: "English",
      genres: ["Drama", "Fantasy", "Science-Fiction"],
      status: "Running",
      runtime: 60,
      premiered: "2016-07-15",
      ended: null,
      rating: { average: 8.5 },
      webChannel: { name: "Netflix" },
      officialSite: "https://www.netflix.com/title/80057281",
      url: "https://www.tvmaze.com/shows/2993/stranger-things",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/394/986161.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/394/986161.jpg"
      },
      summary: "<p>เรื่องราวลึกลับในเมืองฮอว์กินส์ รัฐอินเดียนา เมื่อเด็กชายคนหนึ่งหายตัวไปอย่างเป็นปริศนา เพื่อนๆ และครอบครัวจึงร่วมมือกันตามหา จนค้นพบการทดลองลับของรัฐบาล ประตูลับสู่มิติอื่น และเด็กสาวพลังจิตชื่อ Eleven</p>"
    }
  },
  {
    score: 0.95,
    show: {
      id: 53647,
      name: "Wednesday",
      type: "Scripted",
      language: "English",
      genres: ["Comedy", "Fantasy", "Mystery"],
      status: "Running",
      runtime: 50,
      premiered: "2022-11-23",
      ended: null,
      rating: { average: 8.1 },
      webChannel: { name: "Netflix" },
      officialSite: "https://www.netflix.com/title/81231974",
      url: "https://www.tvmaze.com/shows/53647/wednesday",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/476/1191375.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/476/1191375.jpg"
      },
      summary: "<p>Wednesday Addams เข้าเรียนที่ Nevermore Academy ที่ซึ่งเธอต้องพยายามฝึกฝนพลังจิต สืบสวนคดีฆาตกรรมต่อเนื่องสะเทือนขวัญ และไขปริศนาเหนือธรรมชาติที่พัวพันกับพ่อแม่ของเธอเมื่อ 25 ปีก่อน</p>"
    }
  },
  {
    score: 0.94,
    show: {
      id: 46562,
      name: "The Last of Us",
      type: "Scripted",
      language: "English",
      genres: ["Drama", "Action", "Science-Fiction"],
      status: "Running",
      runtime: 60,
      premiered: "2023-01-15",
      ended: null,
      rating: { average: 8.7 },
      network: { name: "HBO", country: { name: "United States", code: "US" } },
      officialSite: "https://www.hbo.com/the-last-of-us",
      url: "https://www.tvmaze.com/shows/46562/the-last-of-us",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/498/1245275.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/498/1245275.jpg"
      },
      summary: "<p>20 ปีหลังการล่มสลายของอารยธรรมจากเชื้อรามรณะ โจเอล ผู้รอดชีวิตผู้กร้านโลก ได้รับภารกิจลักลอบพาเอลลี่ เด็กหญิงอายุ 14 ปี ออกจากเขตกักกันทหารข้ามผ่านอเมริกาที่ล่มสลาย</p>"
    }
  },
  {
    score: 0.93,
    show: {
      id: 82,
      name: "Game of Thrones",
      type: "Scripted",
      language: "English",
      genres: ["Drama", "Adventure", "Fantasy"],
      status: "Ended",
      runtime: 60,
      premiered: "2011-04-17",
      ended: "2019-05-19",
      rating: { average: 9.0 },
      network: { name: "HBO", country: { name: "United States", code: "US" } },
      officialSite: "http://www.hbo.com/game-of-thrones",
      url: "https://www.tvmaze.com/shows/82/game-of-thrones",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/498/1245241.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/498/1245241.jpg"
      },
      summary: "<p>มหากาพย์สงครามชิงบัลลังก์เหล็กแห่งทวีปเวสเทอรอส ท่ามกลางการแก่งแย่งอำนาจของตระกูลขุนนาง และภัยคุกคามอันเยือกเย็นจากสิ่งมีชีวิตโบราณหลังกำแพงน้ำแข็ง</p>"
    }
  },
  {
    score: 0.92,
    show: {
      id: 44293,
      name: "Arcane",
      type: "Animation",
      language: "English",
      genres: ["Action", "Adventure", "Science-Fiction", "Fantasy"],
      status: "Ended",
      runtime: 40,
      premiered: "2021-11-06",
      ended: "2024-11-23",
      rating: { average: 8.9 },
      webChannel: { name: "Netflix" },
      officialSite: "https://arcane.com",
      url: "https://www.tvmaze.com/shows/44293/arcane",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/527/1319747.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/527/1319747.jpg"
      },
      summary: "<p>เรื่องราวความขัดแย้งระหว่างเมืองพิลต์โทเวอร์อันเจริญรุ่งเรือง และเมืองซอนอันมืดมนใต้ดิน จุดกำเนิดของสองแชมเปี้ยนพี่น้อง Vi และ Jinx ในจักรวาล League of Legends</p>"
    }
  },
  {
    score: 0.90,
    show: {
      id: 48118,
      name: "One Piece (Live Action)",
      type: "Scripted",
      language: "English",
      genres: ["Action", "Adventure", "Comedy"],
      status: "Running",
      runtime: 60,
      premiered: "2023-08-31",
      ended: null,
      rating: { average: 8.2 },
      webChannel: { name: "Netflix" },
      officialSite: "https://www.netflix.com/title/80217863",
      url: "https://www.tvmaze.com/shows/48118/one-piece",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/476/1190471.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/476/1190471.jpg"
      },
      summary: "<p>มังกี้ ดี. ลูฟี่ เด็กหนุ่มผู้มีความฝันอยากเป็นราชาโจรสลัด ออกรวบรวมพรรคพวกกลุ่มหมวกฟาง มุ่งหน้าสู่แกรนด์ไลน์เพื่อตามหาสมบัติในตำนาน 'วันพีซ'</p>"
    }
  },
  {
    score: 0.89,
    show: {
      id: 37920,
      name: "Shōgun",
      type: "Scripted",
      language: "English",
      genres: ["Drama", "History", "War"],
      status: "Running",
      runtime: 60,
      premiered: "2024-02-27",
      ended: null,
      rating: { average: 8.6 },
      network: { name: "FX", country: { name: "United States", code: "US" } },
      officialSite: "https://www.fxnetworks.com/shows/shogun",
      url: "https://www.tvmaze.com/shows/37920/shogun",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/499/1247926.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/499/1247926.jpg"
      },
      summary: "<p>ซีรีส์ประวัติศาสตร์ฟอร์มยักษ์ในยุคเอโดะของญี่ปุ่น เมื่อเรืออังกฤษอับปาง ชายชาวอังกฤษต้องเข้าไปพัวพันกับการชิงอำนาจทางการเมืองของลอร์ดโทรานางะเพื่อขึ้นสู่ตำแหน่งโชกุน</p>"
    }
  },
  {
    score: 0.88,
    show: {
      id: 48600,
      name: "Fallout",
      type: "Scripted",
      language: "English",
      genres: ["Action", "Adventure", "Science-Fiction"],
      status: "Running",
      runtime: 60,
      premiered: "2024-04-10",
      ended: null,
      rating: { average: 8.4 },
      webChannel: { name: "Amazon Prime Video" },
      officialSite: "https://www.amazon.com/dp/B0CN476DCZ",
      url: "https://www.tvmaze.com/shows/48600/fallout",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/508/1271167.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/508/1271167.jpg"
      },
      summary: "<p>200 ปีหลังวันโลกาวินาศจากสงครามนิวเคลียร์ ผู้อยู่อาศัยในหลุมหลบภัยสุดหรูถูกบีบให้ต้องก้าวเท้าออกมาสู่ผืนพิภพที่เต็มไปด้วยรังสีและสัตว์กลายพันธุ์อันตราย</p>"
    }
  },
  {
    score: 0.87,
    show: {
      id: 335,
      name: "Sherlock",
      type: "Scripted",
      language: "English",
      genres: ["Crime", "Drama", "Mystery"],
      status: "Ended",
      runtime: 90,
      premiered: "2010-07-25",
      ended: "2017-01-15",
      rating: { average: 8.9 },
      network: { name: "BBC One", country: { name: "United Kingdom", code: "GB" } },
      officialSite: "http://www.bbc.co.uk/programmes/b018ttws",
      url: "https://www.tvmaze.com/shows/335/sherlock",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/157/393717.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/157/393717.jpg"
      },
      summary: "<p>การดัดแปลงนิยายสืบสวนชื่อก้องโลกของ Arthur Conan Doyle สู่กรุงลอนดอนยุคปัจจุบัน โดยมี Benedict Cumberbatch รับบทเชอร์ล็อก โฮล์มส์ และ Martin Freeman รับบทหมอจอห์น วัตสัน</p>"
    }
  },
  {
    score: 0.86,
    show: {
      id: 504,
      name: "Batman: The Animated Series",
      type: "Animation",
      language: "English",
      genres: ["Action", "Adventure", "Crime"],
      status: "Ended",
      runtime: 30,
      premiered: "1992-09-05",
      ended: "1995-09-15",
      rating: { average: 8.8 },
      network: { name: "FOX", country: { name: "United States", code: "US" } },
      officialSite: null,
      url: "https://www.tvmaze.com/shows/504/batman-the-animated-series",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/4/11559.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/4/11559.jpg"
      },
      summary: "<p>อนิเมชั่นระดับมาสเตอร์พีซของอัศวินรัตติกาล แบทแมนปกป้องเมืองก็อตแธมจากเหล่าวายร้ายระดับตำนาน ทั้งโจ๊กเกอร์ แคทวูแมน และเพนกวิน ในสไตล์ฟิล์มนัวร์สุดคลาสสิก</p>"
    }
  },
  {
    score: 0.85,
    show: {
      id: 48805,
      name: "Avatar: The Last Airbender",
      type: "Scripted",
      language: "English",
      genres: ["Action", "Adventure", "Fantasy"],
      status: "Running",
      runtime: 55,
      premiered: "2024-02-22",
      ended: null,
      rating: { average: 7.7 },
      webChannel: { name: "Netflix" },
      officialSite: "https://www.netflix.com/title/80237957",
      url: "https://www.tvmaze.com/shows/48805/avatar-the-last-airbender",
      image: {
        medium: "https://static.tvmaze.com/uploads/images/medium_portrait/499/1247953.jpg",
        original: "https://static.tvmaze.com/uploads/images/original_untouched/499/1247953.jpg"
      },
      summary: "<p>เรื่องราวของ แอง อวตารหนุ่มน้อยผู้ควบคุมธาตุลมคนสุดท้าย เขาต้องฝึกฝนการควบคุมธาตุทั้ง 4 เพื่อหยุดยั้งการรุกรานของเผ่าอัคคีและกอบกู้สันติสุขกลับคืนสู่โลก</p>"
    }
  }
];

// ============================================================================
// 1. Poster Fallback Component (เมื่อไม่มีรูปจาก API หรือรูปโหลดไม่ผ่าน)
// ============================================================================
function PosterFallback({ title }) {
  return (
    <div className="poster-fallback" aria-label={`ไม่มีรูปภาพสำหรับ ${title}`}>
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
      <span className="poster-fallback-title">{title || "ไม่มีชื่อเรื่อง"}</span>
      <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>ไม่มีภาพโปสเตอร์</span>
    </div>
  );
}

// ============================================================================
// 2. User Journey Tracker Component (5 ขั้นตอน ตรงตามโจทย์ในสไลด์)
// 1. กรอกคำค้น -> 2. ค้นหา -> 3. รอผล -> 4. ดูผล -> 5. ค้นใหม่
// ============================================================================
function JourneyTracker({ currentStep, onReset }) {
  const steps = [
    { num: 1, label: "1. กรอกคำค้น" },
    { num: 2, label: "2. ค้นหา" },
    { num: 3, label: "3. รอผล" },
    { num: 4, label: "4. ดูผลลัพธ์" },
    { num: 5, label: "5. ค้นใหม่" }
  ];

  return (
    <nav className="journey-container" aria-label="User Journey ขั้นตอนการใช้งาน">
      <div className="journey-header">
        <span className="journey-header-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          User Journey Tracker (ขั้นตอนการทำงานระบบ)
        </span>
        <span className="journey-header-desc">
          สเตตัสปัจจุบัน: ขั้นที่ {currentStep} {steps[currentStep - 1]?.label.replace(/^\d+\.\s*/, "")}
        </span>
      </div>

      <div className="journey-steps-row">
        {steps.map((s, idx) => {
          const isActive = currentStep === s.num;
          const isCompleted = currentStep > s.num;
          return (
            <React.Fragment key={s.num}>
              <div
                className={`journey-step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                title={`ขั้นตอนที่ ${s.num}: ${s.label}`}
              >
                <span className="step-circle">{isCompleted ? "✓" : s.num}</span>
                <span>{s.label}</span>
              </div>
              {idx < steps.length - 1 && <span className="journey-connector">➜</span>}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================================================
// 3. ✨ แถบหนังแนะนำ (Recommended Shows Strip)
// แถบแนวนอนเลื่อนได้ พร้อมป้าย #1 แนะนำ, เรตติ้ง 8.5+, คลิกดูรายละเอียดได้ทันที
// ============================================================================
function RecommendedBar({ shows, onSelectShow }) {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="recommended-section" aria-label="แถบหนังแนะนำสำหรับคุณ">
      <div className="section-header-row">
        <div className="section-title-group">
          <h2 className="section-title">
            <span className="section-icon">🔥</span> แถบหนังและซีรีส์แนะนำ (Featured Highlights)
          </h2>
          <p className="section-subtitle">
            คัดสรรผลงานระดับตำนาน เรตติ้งสูงสุด การันตีความยอดเยี่ยม พร้อมให้สำรวจทันที
          </p>
        </div>

        <div className="recommended-nav-buttons">
          <button
            type="button"
            className="nav-arrow-btn"
            onClick={scrollLeft}
            aria-label="เลื่อนไปทางซ้าย"
            title="เลื่อนไปทางซ้าย"
          >
            ❮
          </button>
          <button
            type="button"
            className="nav-arrow-btn"
            onClick={scrollRight}
            aria-label="เลื่อนไปทางขวา"
            title="เลื่อนไปทางขวา"
          >
            ❯
          </button>
        </div>
      </div>

      <div className="recommended-scroll-strip" ref={scrollContainerRef}>
        {shows.map((item, idx) => {
          const show = item.show;
          const imageUrl = show.image?.medium || show.image?.original;
          const rating = show.rating?.average ? show.rating.average : "N/A";
          const genres = show.genres?.slice(0, 2).join(", ") || "ทั่วไป";

          return (
            <article
              key={`rec-${show.id || idx}`}
              className="rec-card"
              onClick={() => onSelectShow(show)}
              tabIndex={0}
              role="button"
              aria-label={`ดูรายละเอียด ${show.name}`}
            >
              <div className="rec-poster-wrapper">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={show.name}
                    className="rec-poster-img"
                    loading="lazy"
                  />
                ) : (
                  <PosterFallback title={show.name} />
                )}

                <div className="rec-rank-badge">
                  <span>🏆 #{idx + 1}</span>
                </div>

                <div className="rec-rating-badge">
                  <span>⭐ {rating}</span>
                </div>
              </div>

              <div className="rec-info">
                <h3 className="rec-title" title={show.name}>
                  {show.name}
                </h3>
                <div className="rec-genre-row">
                  <span>🎬 {genres}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================================
// 4. Movie Card Component (การ์ดแสดงผลลัพธ์และหนังหน้าหลัก)
// แสดง: ชื่อ รูปภาพ เรตติ้ง แนวซีรีส์ ปีที่เริ่มฉาย สถานะ และเรื่องย่อแบบย่อ
// ============================================================================
function MovieCard({ showItem, onSelectShow }) {
  const show = showItem?.show || {};
  const name = show.name || "ไม่ระบุชื่อ";
  const imageUrl = show.image?.medium || show.image?.original;
  const rating = show.rating?.average ? `${show.rating.average} / 10` : "ไม่มีคะแนน";
  const year = show.premiered ? show.premiered.slice(0, 4) : "ไม่ระบุปี";
  const isRunning = show.status === "Running";
  const genres = show.genres && show.genres.length > 0 ? show.genres : ["ทั่วไป"];

  // กรอง HTML tags ออกจาก summary สำหรับแสดงตัวอย่าง
  const cleanSummary = show.summary
    ? show.summary.replace(/<[^>]*>/g, "").trim()
    : "ไม่มีข้อมูลเรื่องย่อ";

  return (
    <article
      className="movie-card"
      onClick={() => onSelectShow(show)}
      tabIndex={0}
      role="button"
      aria-label={`คลิกเพื่อดูรายละเอียดเรื่อง ${name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectShow(show);
        }
      }}
    >
      <div className="card-poster-wrapper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="card-poster-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <PosterFallback title={name} />
        )}

        <div className="card-badges-overlay">
          <span className="badge-rating">
            ⭐ {show.rating?.average ? show.rating.average : "N/A"}
          </span>
          <span className={`badge-status ${isRunning ? "running" : "ended"}`}>
            {isRunning ? "กำลังออกอากาศ" : "จบแล้ว"}
          </span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title" title={name}>
          {name}
        </h3>

        <div className="card-meta-line">
          <span>📅 ปี {year}</span>
          <span className="card-meta-dot" />
          <span>⭐ {rating}</span>
        </div>

        <div className="card-genres">
          {genres.slice(0, 3).map((g) => (
            <span key={g} className="genre-tag">
              {g}
            </span>
          ))}
        </div>

        <p className="card-summary-snippet">{cleanSummary}</p>

        <div className="card-footer-action">
          <span>ดูข้อมูลเชิงลึก</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// 5. ✨ หนังที่อยู่หน้าหลัก (Home Showcase Collection)
// แสดงเมื่อเปิดเว็บหน้าแรก หรือเมื่อกดกลับมาดูรายการหลัก พร้อมตัวกรองหมวดหมู่
// ============================================================================
function HomeShowcase({ shows, activeCategory, onSelectCategory, onSelectShow }) {
  const categories = [
    { id: "all", label: "🌟 ทั้งหมด" },
    { id: "Drama", label: "🎭 ดราม่า (Drama)" },
    { id: "Action", label: "💥 แอ็กชัน (Action)" },
    { id: "Science-Fiction", label: "🚀 ไซไฟ (Sci-Fi)" },
    { id: "Animation", label: "🎨 แอนิเมชัน" },
    { id: "Crime", label: "🔍 อาชญากรรม" },
    { id: "Fantasy", label: "🔮 แฟนตาซี" }
  ];

  const filteredShows = useMemo(() => {
    if (activeCategory === "all") return shows;
    return shows.filter((item) =>
      item.show?.genres?.some(
        (g) => g.toLowerCase() === activeCategory.toLowerCase()
      )
    );
  }, [shows, activeCategory]);

  return (
    <section className="home-showcase-section" aria-label="คลังซีรีส์และภาพยนตร์หน้าหลัก">
      <div className="section-header-row">
        <div className="section-title-group">
          <h2 className="section-title">
            <span className="section-icon">🎬</span> หนังและซีรีส์หน้าหลัก (Home Collection)
          </h2>
          <p className="section-subtitle">
            เลือกดูตามหมวดหมู่ หรือคลิกการ์ดเพื่อเปิดดูรายละเอียดเรื่องย่อแบบเจาะลึก
          </p>
        </div>

        <span className="tag-chip" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
          ทั้งหมด {filteredShows.length} เรื่อง
        </span>
      </div>

      {/* แถบตัวกรองหมวดหมู่ */}
      <div className="category-tabs-bar" role="tablist" aria-label="เลือกหมวดหมู่">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`tab-btn ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid การ์ดหน้าหลัก */}
      <div className="cards-grid">
        {filteredShows.map((item) => (
          <MovieCard
            key={`home-${item.show.id}`}
            showItem={item}
            onSelectShow={onSelectShow}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// 6. Detail Modal Component (หน้าต่างแสดงรายละเอียดซีรีส์แบบเต็ม)
// ============================================================================
function DetailModal({ show, onClose }) {
  if (!show) return null;

  const imageUrl = show.image?.original || show.image?.medium;
  const rating = show.rating?.average ? `${show.rating.average} / 10 ⭐` : "ไม่มีคะแนน";
  const genres = show.genres?.join(", ") || "ไม่ระบุหมวดหมู่";
  const network = show.network?.name
    ? `${show.network.name} (${show.network.country?.code || ""})`
    : show.webChannel?.name || "สตรีมมิ่งออนไลน์ / ไม่ระบุ";
  const runtime = show.runtime
    ? `${show.runtime} นาที / ตอน`
    : show.averageRuntime
    ? `${show.averageRuntime} นาที (เฉลี่ย)`
    : "ไม่ระบุ";
  const premiered = show.premiered || "ไม่ระบุ";
  const ended = show.ended || (show.status === "Running" ? "กำลังออกอากาศอยู่" : "จบแล้ว");
  const language = show.language || "English";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`รายละเอียดเรื่อง ${show.name}`}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="ปิดหน้าต่างรายละเอียด"
        >
          ✕
        </button>

        <div className="modal-grid">
          <div className="modal-poster-col">
            {imageUrl ? (
              <img src={imageUrl} alt={show.name} className="modal-poster-img" />
            ) : (
              <PosterFallback title={show.name} />
            )}
          </div>

          <div className="modal-details-col">
            <h2 className="modal-title">{show.name}</h2>

            <div className="modal-badges-row">
              <span className="badge-rating">{rating}</span>
              <span className={`badge-status ${show.status === "Running" ? "running" : "ended"}`}>
                {show.status === "Running" ? "🟢 กำลังออกอากาศ (Running)" : "⚪ จบแล้ว (Ended)"}
              </span>
              <span className="genre-tag" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                {show.type || "Scripted"}
              </span>
            </div>

            <div
              className="modal-summary"
              dangerouslySetInnerHTML={{
                __html: show.summary || "<p>ไม่มีเรื่องย่อสำหรับรายการนี้</p>"
              }}
            />

            <div className="modal-info-grid">
              <div className="info-item">
                <span className="info-label">หมวดหมู่ (Genres)</span>
                <span className="info-value">{genres}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ช่อง / ผู้จัด (Network)</span>
                <span className="info-value">{network}</span>
              </div>
              <div className="info-item">
                <span className="info-label">เริ่มออกอากาศ (Premiered)</span>
                <span className="info-value">{premiered}</span>
              </div>
              <div className="info-item">
                <span className="info-label">สิ้นสุด (Ended)</span>
                <span className="info-value">{ended}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ความยาว (Runtime)</span>
                <span className="info-value">{runtime}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ภาษาต้นฉบับ (Language)</span>
                <span className="info-value">{language}</span>
              </div>
            </div>

            <div className="modal-actions-row">
              {show.officialSite && (
                <a
                  href={show.officialSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-link-btn primary"
                >
                  🌐 เว็บไซต์ทางการ
                </a>
              )}
              {show.url && (
                <a
                  href={show.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-link-btn secondary"
                >
                  🎬 ดูบน TVmaze
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. Skeleton Loading Component (ขณะรอผลลัพธ์)
// ============================================================================
function SkeletonGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="loading-banner">
        <div className="spinner" />
        <span>กำลังเชื่อมต่อกับ TVmaze API และค้นหาซีรีส์...</span>
      </div>
      <div className="skeleton-grid" aria-label="กำลังโหลดข้อมูล">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 7.1 React Course API Auth Helpers & Constants
// ============================================================================
const AUTH_API_BASE = "https://react-api.dev2life.workers.dev/api/v1";

const tokenStorage = {
  get access() {
    return localStorage.getItem("movie_access_token") || "";
  },
  get refresh() {
    return localStorage.getItem("movie_refresh_token") || "";
  },
  save(tokens) {
    if (tokens.accessToken) localStorage.setItem("movie_access_token", tokens.accessToken);
    if (tokens.refreshToken) localStorage.setItem("movie_refresh_token", tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem("movie_access_token");
    localStorage.removeItem("movie_refresh_token");
  }
};

// ============================================================================
// 7.2 Auth Modal Component (Login, Register & Profile)
// ============================================================================
function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onRegister,
  onLogout,
  isAuthLoading,
  authError,
  setAuthError
}) {
  const [activeTab, setActiveTab] = useState(currentUser ? "profile" : "login");

  // Login form state
  const [email, setEmail] = useState("user@demo.com");
  const [password, setPassword] = useState("Password123");
  const [fieldErrors, setFieldErrors] = useState({});

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regFieldErrors, setRegFieldErrors] = useState({});
  const [regError, setRegError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setActiveTab("profile");
    } else if (activeTab === "profile") {
      setActiveTab("login");
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleQuickFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword("Password123");
    setAuthError("");
    setFieldErrors({});
    setActiveTab("login");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setFieldErrors({});

    const result = await onLogin(email.trim(), password);
    if (!result.success && result.error?.details) {
      const errMap = {};
      result.error.details.forEach((d) => {
        errMap[d.field] = d.message;
      });
      setFieldErrors(errMap);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegFieldErrors({});

    if (!regName.trim() || regName.trim().length < 2) {
      setRegFieldErrors({ name: "กรุณาระบุชื่ออย่างน้อย 2 ตัวอักษร" });
      return;
    }

    if (regPassword.length < 8) {
      setRegFieldErrors({ password: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegFieldErrors({ confirmPassword: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน" });
      return;
    }

    const result = await onRegister(regName.trim(), regEmail.trim(), regPassword);
    if (!result.success) {
      if (result.error?.details) {
        const errMap = {};
        result.error.details.forEach((d) => {
          errMap[d.field] = d.message;
        });
        setRegFieldErrors(errMap);
      } else if (result.error?.message) {
        setRegError(result.error.message);
      }
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="ระบบสมาชิก"
    >
      <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
        >
          ✕
        </button>

        <div className="auth-modal-header">
          <h2 className="auth-modal-title">
            <span>🔐</span>
            <span>
              {currentUser
                ? "โปรไฟล์สมาชิก (User Profile)"
                : activeTab === "register"
                ? "สมัครสมาชิกใหม่ (Register)"
                : "เข้าสู่ระบบ (React Course API)"}
            </span>
          </h2>
          <p className="auth-modal-subtitle">
            เชื่อมต่อกับ Cloudflare Workers API • ตรวจสอบสิทธิ์ด้วย JWT Token
          </p>
        </div>

        {/* Tab Switcher */}
        {!currentUser && (
          <div className="auth-tabs-bar">
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => { setActiveTab("login"); setAuthError(""); }}
            >
              <span>🔑 เข้าสู่ระบบ</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === "register" ? "active" : ""}`}
              onClick={() => { setActiveTab("register"); setRegError(""); }}
            >
              <span>📝 สมัครสมาชิก</span>
            </button>
          </div>
        )}

        {/* Tab Content 1: Login Form */}
        {!currentUser && activeTab === "login" && (
          <div>
            {/* Quick Demo Pill Section */}
            <div className="quick-demo-section">
              <div className="quick-demo-title">
                <span>⚡ เลือกบัญชีทดสอบด่วน (Demo Accounts)</span>
              </div>
              <div className="quick-demo-buttons">
                <button
                  type="button"
                  className="demo-chip-btn"
                  onClick={() => handleQuickFill("user@demo.com", "USER")}
                >
                  🟢 User (user@demo.com)
                </button>
                <button
                  type="button"
                  className="demo-chip-btn"
                  onClick={() => handleQuickFill("admin@demo.com", "ADMIN")}
                >
                  👑 Admin (admin@demo.com)
                </button>
                <button
                  type="button"
                  className="demo-chip-btn"
                  onClick={() => handleQuickFill("banned@demo.com", "BANNED")}
                >
                  🚫 Banned (banned@demo.com)
                </button>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-form-card">
              {authError && (
                <div className="auth-error-banner">
                  <span>⚠️</span>
                  <span>{authError}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email-input">อีเมล (Email)</label>
                <input
                  id="auth-email-input"
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น user@demo.com"
                  required
                />
                {fieldErrors.email && (
                  <span className="auth-field-error">⚠️ {fieldErrors.email}</span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="auth-pass-input">รหัสผ่าน (Password)</label>
                <input
                  id="auth-pass-input"
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {fieldErrors.password && (
                  <span className="auth-field-error">⚠️ {fieldErrors.password}</span>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isAuthLoading}
              >
                {isAuthLoading ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18 }} />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 เข้าสู่ระบบ (POST /auth/login)</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "0.6rem", fontSize: "0.84rem", color: "var(--text-muted)" }}>
                ยังไม่มีบัญชีสมาชิก?{" "}
                <button
                  type="button"
                  onClick={() => { setActiveTab("register"); setRegError(""); }}
                  style={{ background: "none", border: "none", color: "var(--accent-gold)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                >
                  สมัครสมาชิกใหม่ที่นี่
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content 2: Register Form */}
        {!currentUser && activeTab === "register" && (
          <div>
            <form onSubmit={handleRegisterSubmit} className="auth-form-card">
              {regError && (
                <div className="auth-error-banner">
                  <span>⚠️</span>
                  <span>{regError}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-reg-name">ชื่อ - นามสกุล หรือชื่อเรียก (Name)</label>
                <input
                  id="auth-reg-name"
                  type="text"
                  className="auth-input"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี หรือ ชิษณุพงศ์"
                  required
                  minLength={2}
                />
                {regFieldErrors.name && (
                  <span className="auth-field-error">⚠️ {regFieldErrors.name}</span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="auth-reg-email">อีเมล (Email)</label>
                <input
                  id="auth-reg-email"
                  type="email"
                  className="auth-input"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="เช่น user@example.com"
                  required
                />
                {regFieldErrors.email && (
                  <span className="auth-field-error">⚠️ {regFieldErrors.email}</span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="auth-reg-pass">รหัสผ่าน (Password - อย่างน้อย 8 ตัวอักษร)</label>
                <input
                  id="auth-reg-pass"
                  type="password"
                  className="auth-input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร เช่น Password123"
                  required
                  minLength={8}
                />
                {regFieldErrors.password && (
                  <span className="auth-field-error">⚠️ {regFieldErrors.password}</span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="auth-reg-confirm">ยืนยันรหัสผ่าน (Confirm Password)</label>
                <input
                  id="auth-reg-confirm"
                  type="password"
                  className="auth-input"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านเดิมอีกครั้ง"
                  required
                />
                {regFieldErrors.confirmPassword && (
                  <span className="auth-field-error">⚠️ {regFieldErrors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isAuthLoading}
              >
                {isAuthLoading ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18 }} />
                    <span>กำลังส่งข้อมูลสมัครสมาชิก...</span>
                  </>
                ) : (
                  <>
                    <span>✨ ยืนยันสมัครสมาชิก (POST /auth/register)</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "0.6rem", fontSize: "0.84rem", color: "var(--text-muted)" }}>
                มีบัญชีสมาชิกอยู่แล้ว?{" "}
                <button
                  type="button"
                  onClick={() => { setActiveTab("login"); setAuthError(""); }}
                  style={{ background: "none", border: "none", color: "var(--accent-gold)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                >
                  เข้าสู่ระบบที่นี่
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content: Profile View */}
        {currentUser && activeTab === "profile" && (
          <div className="profile-card">
            <div className="profile-top">
              <div className="profile-avatar-large">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  currentUser.name ? currentUser.name.charAt(0) : "👤"
                )}
              </div>
              <div className="profile-main-info">
                <h3 className="profile-name">{currentUser.name}</h3>
                <span className="profile-email">{currentUser.email}</span>
                <div style={{ marginTop: "0.25rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span className={`auth-role-tag ${currentUser.role?.toLowerCase()}`}>
                    สิทธิ์: {currentUser.role}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>
                    ● สถานะ: {currentUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <span className="profile-detail-label">User ID (UUID)</span>
                <span className="profile-detail-val" style={{ fontSize: "0.75rem" }}>{currentUser.id}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">ประเภทบัญชี</span>
                <span className="profile-detail-val">{currentUser.isProtected ? "🛡️ บัญชีตัวอย่าง (Demo)" : "ผู้ใช้ทั่วไป"}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">วันที่สมัครสมาชิก</span>
                <span className="profile-detail-val">
                  {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">การตรวจสอบสิทธิ์</span>
                <span className="profile-detail-val" style={{ color: "#fbbf24" }}>JWT Bearer Token</span>
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="btn-logout"
                onClick={onLogout}
              >
                🚪 ออกจากระบบ (Logout)
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

// ============================================================================
// 8. Main Application Root (App Component)
// ============================================================================
function App() {
  // State 1: ค่าค้นหาที่ผูกกับช่อง input (ตรงตามโจทย์: เก็บค่าค้นด้วย State)
  const [query, setQuery] = useState("");

  // State 2: ผลลัพธ์จากการค้นหา API
  const [results, setResults] = useState([]);

  // State 3: สถานะการทำงาน 4 สถานะหลัก ('idle' | 'loading' | 'success' | 'empty' | 'error')
  const [status, setStatus] = useState("idle");

  // State 4: ข้อความแจ้งเตือนเมื่อ trim() ตรวจพบค่าว่าง
  const [validationError, setValidationError] = useState("");

  // State 5: ข้อความแจ้งข้อผิดพลาดเมื่อ API ล้มเหลว
  const [errorMessage, setErrorMessage] = useState("");

  // State 6: คำค้นล่าสุดที่ค้นหาสำเร็จ
  const [lastSearched, setLastSearched] = useState("");

  // State 7: ซีรีส์ที่เลือกเปิดใน Modal
  const [selectedShow, setSelectedShow] = useState(null);

  // State 8: User Journey ขั้นตอน (1-5)
  const [currentStep, setCurrentStep] = useState(1);

  // State 9: หนังหน้าหลัก (Home Shows Data)
  const [homeShows, setHomeShows] = useState(CURATED_DEFAULT_SHOWS);

  // State 10: แท็บหมวดหมู่ที่เลือกในหน้าหลัก
  const [activeCategory, setActiveCategory] = useState("all");

  // State 11: Auth State จาก React Course API
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // กู้คืนเซสชันเมื่อโหลดหน้าเว็บใหม่จาก localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const token = tokenStorage.access;
      if (!token) return;

      try {
        const res = await fetch(`${AUTH_API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setCurrentUser(json.data);
        } else {
          tokenStorage.clear();
        }
      } catch (err) {
        console.warn("Restore session failed:", err);
      }
    };

    restoreSession();
  }, []);

  // ฟังก์ชัน Login ไปยัง React Course API
  const handleLogin = async (loginEmail, loginPassword) => {
    setIsAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch(`${AUTH_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.error?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        setAuthError(errorMsg);
        setIsAuthLoading(false);
        return { success: false, error: json.error };
      }

      // เข้าสู่ระบบสำเร็จ
      const { user, accessToken, refreshToken } = json.data;
      tokenStorage.save({ accessToken, refreshToken });
      setCurrentUser(user);

      setIsAuthLoading(false);
      return { success: true, user };
    } catch (err) {
      const netError = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
      setAuthError(netError);
      setIsAuthLoading(false);
      return { success: false, error: { message: netError } };
    }
  };

  // ฟังก์ชัน Logout
  const handleLogout = async () => {
    const refreshToken = tokenStorage.refresh;

    if (refreshToken) {
      try {
        await fetch(`${AUTH_API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        });
      } catch (e) {
        console.warn("Logout request failed:", e);
      }
    }

    tokenStorage.clear();
    setCurrentUser(null);
  };

  // ฟังก์ชันสมัครสมาชิกใหม่ (Register) ไปยัง React Course API
  const handleRegister = async (name, email, password) => {
    setIsAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch(`${AUTH_API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.error?.message || "สมัครสมาชิกไม่สำเร็จ";
        setAuthError(errorMsg);
        setIsAuthLoading(false);
        return { success: false, error: json.error };
      }

      // สมัครสมาชิกสำเร็จ (API จะ login ให้อัตโนมัติ ได้ token ทันที)
      const { user, accessToken, refreshToken } = json.data;
      tokenStorage.save({ accessToken, refreshToken });
      setCurrentUser(user);

      setIsAuthLoading(false);
      return { success: true, user };
    } catch (err) {
      const netError = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
      setAuthError(netError);
      setIsAuthLoading(false);
      return { success: false, error: { message: netError } };
    }
  };

  // โหลดข้อมูลเพิ่มเติมสำหรับหน้าหลักจากไฟล์ defaultShows.json หรือ fallback
  useEffect(() => {
    const loadDefaultShows = async () => {
      try {
        const res = await fetch("defaultShows.json");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHomeShows(data);
          }
        }
      } catch (e) {
        console.log("Using embedded curated fallback shows.");
      }
    };
    loadDefaultShows();
  }, []);

  // ฟังก์ชันค้นหาหลัก (ตรงตามเกณฑ์: trim(), URLSearchParams, fetch async/await)
  const performSearch = useCallback(async (searchWord) => {
    // โจทย์: ใช้ trim() ตรวจคำค้นว่างและแสดงข้อความเตือน
    const trimmed = (searchWord || "").trim();

    if (!trimmed) {
      setValidationError("กรุณากรอกชื่อซีรีส์ที่ต้องการค้นหา (ห้ามเว้นว่าง)");
      setCurrentStep(1); // กลับสู่ขั้นที่ 1: กรอกคำค้น
      return;
    }

    // เคลียร์ข้อความแจ้งเตือนเดิม
    setValidationError("");
    setStatus("loading");
    setCurrentStep(3); // ขั้นที่ 3: รอผล
    setLastSearched(trimmed);

    try {
      // โจทย์: สร้าง URL จากคำค้นด้วย URLSearchParams
      const searchParams = new URLSearchParams({ q: trimmed });
      const apiUrl = `https://api.tvmaze.com/search/shows?${searchParams.toString()}`;

      // โจทย์: ใช้ fetch และ async/await
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`เซิร์ฟเวอร์ตอบกลับรหัส: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // โจทย์: มี Loading / Success / Empty / Error
      if (!data || data.length === 0) {
        setResults([]);
        setStatus("empty");
        setCurrentStep(4); // ขั้นที่ 4: ดูผล (ไม่พบ)
      } else {
        setResults(data);
        setStatus("success");
        setCurrentStep(4); // ขั้นที่ 4: ดูผลลัพธ์
      }
    } catch (err) {
      console.error("TVmaze Fetch Error:", err);

      // ตรวจสอบ fallback จาก curated collection หากเน็ตมีปัญหา
      const localMatches = homeShows.filter((item) =>
        item.show?.name?.toLowerCase().includes(trimmed.toLowerCase())
      );

      if (localMatches.length > 0) {
        setResults(localMatches);
        setStatus("success");
        setCurrentStep(4);
      } else {
        setErrorMessage(
          err.message || "ไม่สามารถเชื่อมต่อกับ TVmaze API ได้ กรุณาตรวจสอบอินเทอร์เน็ต"
        );
        setStatus("error");
        setCurrentStep(4);
      }
    }
  }, [homeShows]);

  // ฟังก์ชัน Submit ฟอร์ม (ตรงตามเกณฑ์: ป้องกัน Reload ด้วย preventDefault และป้องกัน Submit ซ้ำ)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (status === "loading") return; // ป้องกัน Submit ซ้ำ
    setCurrentStep(2); // ขั้นที่ 2: ค้นหา
    performSearch(query);
  };

  // ฟังก์ชันคลิกแท็กคำค้นด่วน
  const handleQuickTag = (tag) => {
    setQuery(tag);
    setValidationError("");
    setCurrentStep(2);
    performSearch(tag);
  };

  // ฟังก์ชันล้างคำค้น (Clear)
  const handleClear = () => {
    setQuery("");
    setValidationError("");
    setCurrentStep(5); // ขั้นที่ 5: ค้นใหม่
  };

  // ฟังก์ชันรีเซ็ตกลับหน้าหลัก (Home)
  const handleBackToHome = () => {
    setQuery("");
    setStatus("idle");
    setResults([]);
    setLastSearched("");
    setValidationError("");
    setCurrentStep(1);
  };

  // ฟังก์ชันลองใหม่อีกครั้ง (Retry เมื่อ Error)
  const handleRetry = () => {
    performSearch(lastSearched || query);
  };

  const quickSuggestions = [
    "Batman",
    "Stranger Things",
    "Breaking Bad",
    "Wednesday",
    "The Last of Us",
    "One Piece",
    "Avatar"
  ];

  return (
    <div className="app-container">
      {/* พื้นหลังแสงอบอุ่นแบบ Ambient Orbs */}
      <div className="bg-ambient" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      {/* Navbar ด้านบน */}
      <header className="navbar">
        <div className="nav-brand" onClick={handleBackToHome} role="button" tabIndex={0}>
          <div className="brand-icon-box">🎬</div>
          <div className="brand-info">
            <span className="brand-title">Movie World</span>
            <span className="brand-tagline">Warm Cozy Cinema • Powered by TVmaze</span>
          </div>
        </div>

        <div className="nav-actions">
          <div className="nav-badge-api">
            <span className="pulse-dot" />
            <span>TVmaze API Live</span>
          </div>

          <button
            type="button"
            className="nav-btn"
            onClick={handleBackToHome}
            title="กลับสู่หน้าหลัก"
          >
            🏠 หน้าหลัก
          </button>

          {/* ปุ่มเข้าสู่ระบบ / ดูโปรไฟล์ (React Course API) */}
          {currentUser ? (
            <button
              type="button"
              className="auth-user-btn"
              onClick={() => setIsAuthModalOpen(true)}
              title="คลิกเพื่อดูโปรไฟล์สมาชิก"
            >
              <span className="auth-avatar-mini">
                {currentUser.name ? currentUser.name.charAt(0) : "👤"}
              </span>
              <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
              <span className={`auth-role-tag ${currentUser.role?.toLowerCase()}`}>
                {currentUser.role}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="auth-login-btn"
              onClick={() => setIsAuthModalOpen(true)}
              title="เข้าสู่ระบบด้วย React Course API"
            >
              <span>🔑</span>
              <span>เข้าสู่ระบบ (Demo API)</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="hero-section">
        <div className="hero-pill">
          <span>🍿 ดื่มด่ำกับโลกภาพยนตร์และซีรีส์ที่คุณรัก</span>
        </div>
        <h1 className="hero-title">
          ยินดีต้อนรับสู่ <span className="highlight-warm">Movie World</span>
        </h1>
        <p className="hero-description">
          ค้นหาซีรีส์ระดับโลก ตรวจสอบเรตติ้ง เรื่องย่อ วันออกอากาศ และข้อมูลแบบเรียลไทม์
          ในบรรยากาศโทนอุ่นสบายตา ใช้งานง่าย รองรับทุกอุปกรณ์
        </p>
      </section>

      {/* ส่วนฟอร์มค้นหาซีรีส์ (ตรงตามโจทย์: มี label, State, ป้องกัน reload & submit ซ้ำ, trim()) */}
      <section className="search-card">
        <form onSubmit={handleSubmit} className="search-form" noValidate>
          <label htmlFor="movieSearchInput" className="search-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            ค้นหาซีรีส์ใน Movie World (Enter Show Title)
          </label>

          <div className="search-input-wrapper">
            <div className="input-box">
              <span className="input-icon-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>

              <input
                id="movieSearchInput"
                type="text"
                className="search-input"
                placeholder="พิมพ์ชื่อซีรีส์ เช่น Batman, Breaking Bad, Wednesday..."
                value={query}
                disabled={status === "loading"}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (validationError) setValidationError("");
                  setCurrentStep(1); // ขั้นที่ 1: กำลังกรอกคำค้น
                }}
                autoComplete="off"
              />

              {query && (
                <button
                  type="button"
                  className="btn-clear"
                  onClick={handleClear}
                  title="ล้างคำค้น"
                  aria-label="ล้างคำค้น"
                >
                  ✕
                </button>
              )}
            </div>

            {/* ปุ่มค้นหา: ป้องกัน Submit ซ้ำขณะ Loading */}
            <button
              type="submit"
              className="btn-submit"
              disabled={status === "loading"}
              aria-label="กดเพื่อค้นหาซีรีส์"
            >
              {status === "loading" ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  <span>กำลังค้นหา...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>ค้นหาซีรีส์</span>
                </>
              )}
            </button>
          </div>

          {/* ข้อความแจ้งเตือนเมื่อ trim() ตรวจพบคำค้นว่าง */}
          {validationError && (
            <div className="validation-alert" role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{validationError}</span>
            </div>
          )}

          {/* แท็กคำค้นหาด่วน */}
          <div className="quick-tags-container">
            <span className="quick-tags-label">
              <span>💡</span> ลองคลิกค้นหาด่วน:
            </span>
            {quickSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                className="tag-chip"
                disabled={status === "loading"}
                onClick={() => handleQuickTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* แถบแจ้งสถานะคำค้นล่าสุด */}
          {lastSearched && status !== "loading" && (
            <div className="search-status-bar">
              <span>
                ผลการค้นหาสำหรับคำว่า{" "}
                <span className="status-query-badge">"{lastSearched}"</span>
                {status === "success" && ` (พบ ${results.length} รายการ)`}
              </span>
              <span className="api-source-badge">
                GET /search/shows?q={encodeURIComponent(lastSearched)}
              </span>
            </div>
          )}
        </form>
      </section>

      {/* ✨ แถบหนังแนะนำ (Recommended Shows Bar) มีอยู่เสมอเพื่อความสะดวกในการเลือกชม */}
      <RecommendedBar shows={homeShows.slice(0, 8)} onSelectShow={setSelectedShow} />

      {/* พื้นที่แสดงผล: แยกเป็น โหมดผลการค้นหา (4 สถานะ) vs โหมดหน้าหลัก (Home Showcase) */}
      <main id="mainContent">
        {/* สถานะ 1: IDLE -> แสดงหนังและซีรีส์ที่อยู่หน้าหลัก */}
        {status === "idle" && (
          <HomeShowcase
            shows={homeShows}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onSelectShow={setSelectedShow}
          />
        )}

        {/* สถานะ 2: LOADING -> แสดง Skeleton Shimmer Animation */}
        {status === "loading" && <SkeletonGrid />}

        {/* สถานะ 3: EMPTY -> เมื่อค้นหาแล้วไม่พบผลลัพธ์ */}
        {status === "empty" && (
          <div className="state-box">
            <div className="state-icon-box">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h2 className="state-title">ไม่พบซีรีส์ที่ค้นหา</h2>
            <p className="state-desc">
              ไม่พบผลลัพธ์สำหรับคำว่า <strong>"{lastSearched}"</strong> ในระบบ TVmaze
              กรุณาตรวจสอบการสะกดชื่อเรื่อง หรือลองค้นหาด้วยคำอื่น เช่น <em>Batman</em>, <em>Breaking Bad</em>
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              <button type="button" className="nav-btn" onClick={handleClear}>
                ✏️ แก้ไขคำค้นหา
              </button>
              <button type="button" className="btn-retry" onClick={handleBackToHome}>
                🏠 กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        )}

        {/* สถานะ 4: ERROR -> เมื่อเกิดข้อผิดพลาดในการเชื่อมต่อ API */}
        {status === "error" && (
          <div className="state-box">
            <div className="state-icon-box error">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="state-title">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
            <p className="state-desc">{errorMessage}</p>
            <button type="button" className="btn-retry" onClick={handleRetry}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>ลองใหม่อีกครั้ง (Retry)</span>
            </button>
          </div>
        )}

        {/* สถานะ 5: SUCCESS -> แสดงรายการซีรีส์ที่ค้นพบจากการค้นหา */}
        {status === "success" && (
          <section className="search-results-section" aria-label="ผลการค้นหาซีรีส์">
            <div className="section-header-row" style={{ marginBottom: "1.25rem" }}>
              <div className="section-title-group">
                <h2 className="section-title">
                  <span className="section-icon">🔍</span> ผลลัพธ์สำหรับ "{lastSearched}"
                </h2>
                <p className="section-subtitle">
                  พบทั้งหมด {results.length} รายการจากฐานข้อมูล TVmaze API
                </p>
              </div>

              <button type="button" className="nav-btn" onClick={handleBackToHome}>
                ← ดูหนังหน้าหลักทั้งหมด
              </button>
            </div>

            <div className="cards-grid">
              {results.map((item) => (
                <MovieCard
                  key={`result-${item.show.id || item.show.url}`}
                  showItem={item}
                  onSelectShow={setSelectedShow}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modal Popup แสดงข้อมูลเจาะลึกเมื่อคลิกการ์ดซีรีส์ */}
      {selectedShow && (
        <DetailModal show={selectedShow} onClose={() => setSelectedShow(null)} />
      )}

      {/* Modal Popup ระบบสมาชิกและการตรวจสอบสิทธิ์ (React Course API) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        isAuthLoading={isAuthLoading}
        authError={authError}
        setAuthError={setAuthError}
      />

      {/* ส่วนท้าย Footer ระบุแหล่งข้อมูลชัดเจน */}
      <footer className="app-footer">
        <div className="footer-links">
          <span>Movie World 🎬</span>
          <span>•</span>
          <a href="https://www.tvmaze.com/api" target="_blank" rel="noopener noreferrer">
            TVmaze API Documentation
          </a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); handleBackToHome(); }}>
            หน้าแรก
          </a>
        </div>

        <p>
          แหล่งข้อมูล: ข้อมูลภาพยนตร์และซีรีส์ทั้งหมดได้รับอนุญาตจาก{" "}
          <strong style={{ color: "#fbbf24" }}>TVmaze API</strong> (Endpoint:{" "}
          <code>https://api.tvmaze.com/search/shows?q=...</code>)
        </p>

        <div className="footer-badge">
          <span>⚡ Data Flow: Form (Input) ➜ API (TVmaze) ➜ React State ➜ UI Render</span>
        </div>

        <p style={{ fontSize: "0.78rem", opacity: 0.65 }}>
          © 2026 Movie World • พัฒนาด้วย React 18 & Vanilla CSS โทนอบอุ่นสบายตา
        </p>
      </footer>
    </div>
  );
}

// Mount React Root
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
