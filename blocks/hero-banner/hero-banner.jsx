import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function HeroBanner({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplayInterval, setAutoplayInterval] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const track = React.createRef();
  const controls = React.createRef();

  function updateCarousel() {
    if (track.current) {
      track.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    const pagination = controls.current?.querySelector('.hero-pagination');
    if (pagination) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }
    const allSlides = track.current?.querySelectorAll('.hero-slide');
    allSlides?.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', String(index !== currentSlide));
    });
  }

  function prevSlide() {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  }

  function nextSlide() {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      setAutoplayInterval(null);
    }
  }

  function startAutoplay() {
    stopAutoplay();
    setAutoplayInterval(setInterval(() => {
      nextSlide();
    }, 5000));
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      stopAutoplay();
    }
  }

  useEffect(() => {
    updateCarousel();
    startAutoplay();

    return () => {
      stopAutoplay();
    };
  }, [currentSlide]);

  return (
    <div
      className="hero-carousel-wrapper"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          prevSlide();
          stopAutoplay();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
          stopAutoplay();
        }
      }}
      onTouchStart={(e) => setTouchStartX(e.changedTouches[0].screenX)}
      onTouchEnd={(e) => {
        setTouchEndX(e.changedTouches[0].screenX);
        handleSwipe();
      }}
    >
      <div className="hero-carousel-track" ref={track}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className="hero-slide"
            style={{ backgroundImage: `url('${slide['background-image']}')` }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
          >
            <div className="hero-slide-content">
              <h2 className="hero-title">{slide.title}</h2>
              <p className="hero-description">{slide.description}</p>
              <div className="hero-cta-group">
                <a href={slide['know-more-link']} className="hero-btn primary">{slide['know-more-label']}</a>
                <a href={slide['watch-video-link']} className="hero-btn secondary">{slide['watch-video-label']}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hero-controls" ref={controls}>
        <button className="hero-prev" aria-label="Previous slide" type="button" onClick={() => { prevSlide(); stopAutoplay(); }}>←</button>
        <div className="hero-pagination" aria-live="polite" aria-atomic="true">
          01 / {String(slides.length).padStart(2, '0')}
        </div>
        <button className="hero-next" aria-label="Next slide" type="button" onClick={() => { nextSlide(); stopAutoplay(); }}>→</button>
      </div>
    </div>
  );
}

export default async function decorate(block) {
  try {
    const response = await fetch('/blocks/hero-banner/_hero-banner.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch slides: ${response.status}`);
    }
    const data = await response.json();
    const slidesData = data.models.find(model => model.id === 'hero-banner-items');
    const slides = slidesData ? slidesData.fields : [];

    const root = createRoot(block);
    root.render(<HeroBanner slides={slides} />);
  } catch (error) {
    console.error('Error fetching slides:', error);
  }
}
