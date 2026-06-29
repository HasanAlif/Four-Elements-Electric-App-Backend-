import config from '../config';

const BRAND = config.preffered_website_name || 'Four Elements Electric App';

export const LANDING_PAGE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${BRAND} — Electrical Services, Booked in Minutes</title>
    <style>
        :root {
            --bg-color: #0A1A2F;
            --card-bg-dark: rgba(12, 26, 46, 0.95);
            --card-bg-light: rgba(18, 38, 64, 0.95);
            --text-primary: #EAF2FB;
            --text-secondary: #9FB3C8;
            --accent-primary: #01A1FF;
            --accent-blue-deep: #0466C8;
            --accent-spark: #FFB020;
            --gradient-spark: linear-gradient(135deg, #01A1FF, #38BDF8, #FFB020);
            --gradient-primary: linear-gradient(135deg, #01A1FF, #0466C8);
            --gradient-accent: linear-gradient(135deg, #FFB020, #01A1FF);
            --gradient-white: linear-gradient(135deg, #ffffff, #d8ecff);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow-x: hidden;
            background-image:
                radial-gradient(circle at 15% 25%, rgba(1, 161, 255, 0.16) 0%, transparent 35%),
                radial-gradient(circle at 85% 75%, rgba(255, 176, 32, 0.12) 0%, transparent 35%),
                radial-gradient(circle at 50% 50%, rgba(4, 102, 200, 0.10) 0%, transparent 55%);
        }

        /* Floating Particles */
        .spark-particles {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 0;
        }
        .particle {
            position: absolute;
            opacity: 0;
            animation: floatParticle 18s linear infinite;
        }
        @keyframes floatParticle {
            0%   { transform: translateY(110vh) rotate(0deg) scale(0.8); opacity: 0; }
            8%   { opacity: 1; }
            90%  { opacity: 0.8; }
            100% { transform: translateY(-15vh) rotate(360deg) scale(1.1); opacity: 0; filter: drop-shadow(0 0 8px rgba(1, 161, 255, 0.55)); }
        }

        /* Hero Banner */
        .hero {
            text-align: center;
            margin-bottom: 3rem;
            padding: 0 1rem;
        }
        .hero-logo {
            font-size: 3.5rem;
            margin-bottom: 0.4rem;
            animation: zapLogo 4.5s ease-in-out infinite;
            display: inline-block;
        }
        @keyframes zapLogo {
            0%, 100% { transform: rotate(-8deg) scale(1); filter: drop-shadow(0 0 8px rgba(1, 161, 255, 0.45)); }
            45%      { transform: rotate(8deg) scale(1.12); filter: drop-shadow(0 0 18px rgba(255, 176, 32, 0.8)); }
            55%      { transform: rotate(6deg) scale(1.08); filter: drop-shadow(0 0 14px rgba(1, 161, 255, 0.9)); }
        }
        .hero h1 {
            font-size: clamp(2rem, 5vw, 3.2rem);
            font-weight: 900;
            letter-spacing: -1px;
            line-height: 1.15;
            margin-bottom: 0.6rem;
        }
        .hero p {
            font-size: 1.1rem;
            color: var(--text-secondary);
            max-width: 540px;
            margin: 0 auto;
            line-height: 1.6;
        }
        .tagline-divider {
            width: 60px;
            height: 3px;
            background: var(--gradient-spark);
            border-radius: 2px;
            margin: 1rem auto;
        }

        .stage {
            width: 100%;
            max-width: 1200px;
            padding: 2rem;
            z-index: 1;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
            gap: 1.8rem;
        }

        .card {
            padding: 2.2rem;
            border-radius: 24px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(1, 161, 255, 0.18);
            backdrop-filter: blur(14px);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }
        .card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 24px;
            background: linear-gradient(135deg, rgba(1, 161, 255, 0.08), transparent 60%);
            pointer-events: none;
        }
        .card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6),
                        0 0 25px rgba(1, 161, 255, 0.3),
                        0 0 50px rgba(255, 176, 32, 0.14);
            border-color: rgba(1, 161, 255, 0.45);
        }
        .card.light { background-color: var(--card-bg-light); }
        .card.dark  { background-color: var(--card-bg-dark); }

        h2 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.8rem;
            line-height: 1.3;
        }
        p.lead {
            font-size: 1rem;
            color: var(--text-secondary);
            line-height: 1.65;
        }

        .gtext {
            background: var(--gradient-spark);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: 900;
            display: inline-block;
        }
        .gtext2 {
            background: var(--gradient-white);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: 900;
            display: inline-block;
        }

        /* Animated Icon Circle */
        .icon-container {
            width: 75px;
            height: 75px;
            background: linear-gradient(135deg, rgba(1, 161, 255, 0.18), rgba(255, 176, 32, 0.1));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.4rem;
            font-size: 2.2rem;
            border: 1px solid rgba(1, 161, 255, 0.3);
            animation: pulseSpark 3s ease-in-out infinite;
        }
        @keyframes pulseSpark {
            0%   { box-shadow: 0 0 0 0 rgba(1, 161, 255, 0.45); border-color: rgba(1, 161, 255, 0.3); }
            50%  { box-shadow: 0 0 0 15px rgba(1, 161, 255, 0); border-color: rgba(255, 176, 32, 0.65); }
            100% { box-shadow: 0 0 0 0 rgba(1, 161, 255, 0); border-color: rgba(1, 161, 255, 0.3); }
        }

        /* Animated Wrapper */
        .animated-wrapper {
            position: relative;
            display: inline-block;
        }
        .sparkle {
            position: absolute;
            font-size: 0.9rem;
            opacity: 0;
            animation: sparkleAnim 2.5s ease-in-out infinite;
        }
        .sparkle:nth-child(1) { top: -14px; left: -10px; animation-delay: 0s; }
        .sparkle:nth-child(2) { top: -14px; right: -10px; animation-delay: 0.5s; }
        .sparkle:nth-child(3) { bottom: -10px; left: 50%; transform: translateX(-50%); animation-delay: 1s; }
        @keyframes sparkleAnim {
            0%, 100% { opacity: 0; transform: scale(0.4) translateY(0); filter: drop-shadow(0 0 4px rgba(1, 161, 255, 0)); }
            50% { opacity: 1; transform: scale(1.2) translateY(-6px); filter: drop-shadow(0 0 8px rgba(1, 161, 255, 0.7)); }
        }

        /* Status Badge */
        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.45rem 1.1rem;
            background: rgba(40, 167, 69, 0.12);
            border: 1px solid rgba(40, 167, 69, 0.4);
            border-radius: 50px;
            color: #4cd964;
            font-size: 0.88rem;
            font-weight: 600;
            margin-top: 1.4rem;
            transition: all 0.3s ease;
        }
        .status-badge:hover {
            background: rgba(40, 167, 69, 0.22);
            box-shadow: 0 0 16px rgba(76, 217, 100, 0.3);
        }
        .status-dot {
            width: 9px;
            height: 9px;
            background-color: #4cd964;
            border-radius: 50%;
            margin-right: 9px;
            box-shadow: 0 0 8px #4cd964;
            animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.75); }
        }

        /* Services list */
        .skills-list {
            list-style: none;
            margin-top: 1rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .skills-list li {
            background: rgba(1, 161, 255, 0.12);
            border: 1px solid rgba(1, 161, 255, 0.28);
            border-radius: 30px;
            padding: 0.3rem 0.85rem;
            font-size: 0.82rem;
            color: #7CC6FF;
            font-weight: 500;
            transition: all 0.3s;
        }
        .skills-list li:hover {
            background: rgba(1, 161, 255, 0.25);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(1, 161, 255, 0.3);
            color: #EAF2FB;
        }

        /* Feature rows (maintenance card) */
        .feature-list {
            list-style: none;
            margin-top: 1.1rem;
            display: flex;
            flex-direction: column;
            gap: 0.7rem;
        }
        .feature-list li {
            display: flex;
            align-items: center;
            gap: 0.7rem;
            font-size: 0.92rem;
            color: var(--text-secondary);
        }
        .feature-list .fi {
            width: 30px; height: 30px;
            flex-shrink: 0;
            border-radius: 9px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            background: rgba(255, 176, 32, 0.12);
            border: 1px solid rgba(255, 176, 32, 0.3);
        }

        /* Star rating */
        .stars {
            display: flex;
            gap: 4px;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }
        .star {
            animation: starPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform: scale(0);
            opacity: 0;
        }
        .star:nth-child(1) { animation-delay: 0.1s; }
        .star:nth-child(2) { animation-delay: 0.2s; }
        .star:nth-child(3) { animation-delay: 0.3s; }
        .star:nth-child(4) { animation-delay: 0.4s; }
        .star:nth-child(5) { animation-delay: 0.5s; }
        @keyframes starPop {
            to { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 4px rgba(1, 161, 255, 0.6)); }
        }

        .credit {
            margin-top: 1.4rem;
            font-size: 0.8rem;
            color: var(--text-secondary);
            opacity: 0.85;
        }
        .credit .gtext { font-size: 0.8rem; }

    </style>
</head>
<body>
    <div class="spark-particles" id="particles"></div>

    <main class="stage">

        <!-- Hero -->
        <div class="hero">
            <div class="hero-logo">⚡</div>
            <h1><span class="gtext2">Welcome to</span> <span class="gtext">${BRAND}</span></h1>
            <div class="tagline-divider"></div>
            <p>Trusted electricians for every job — from panel upgrades to EV chargers, booked in minutes.</p>
        </div>

        <section>
            <div class="grid">

                <!-- Services Card -->
                <article class="card light">
                    <div class="icon-container">
                        <div class="animated-wrapper">
                            <span class="sparkle">✨</span>
                            <span class="sparkle">💫</span>
                            <span class="sparkle">⚡</span>
                            🔌
                        </div>
                    </div>
                    <h2>Book Any <span class="gtext">Electrical Service</span></h2>
                    <p class="lead">Request a quote in seconds and let a verified pro handle the rest — residential and commercial, big jobs and small.</p>
                    <ul class="skills-list">
                        <li>⚡ Panel Upgrades</li>
                        <li>🔌 Outlets & Switches</li>
                        <li>🔋 EV Chargers</li>
                        <li>💡 Lighting</li>
                        <li>🌀 Ceiling Fans</li>
                        <li>🛟 Generators</li>
                        <li>🛁 Hot Tubs</li>
                    </ul>
                </article>

                <!-- Server Status Card -->
                <article class="card dark">
                    <div class="icon-container">🚀</div>
                    <h2>Server <span class="gtext">Status</span></h2>
                    <p class="lead">All ${BRAND} backend services are fully operational and ready to take quotes, bookings and notifications in real time.</p>
                    <div class="status-badge">
                        <span class="status-dot"></span>
                        System Online
                    </div>
                </article>

                <!-- Maintenance Card -->
                <article class="card light">
                    <div class="stars">
                        <span class="star">⭐</span>
                        <span class="star">⭐</span>
                        <span class="star">⭐</span>
                        <span class="star">⭐</span>
                        <span class="star">⭐</span>
                    </div>
                    <h2>Smarter Home <span class="gtext">Maintenance</span></h2>
                    <p class="lead">Stay ahead of every wire and breaker — ${BRAND} keeps your home safe and your quotes organized.</p>
                    <ul class="feature-list">
                        <li><span class="fi">📋</span> Track quotes from request to completion</li>
                        <li><span class="fi">❤️</span> Save your trusted partners & pros</li>
                        <li><span class="fi">🔔</span> Seasonal maintenance reminders</li>
                    </ul>
                    <p class="credit">Built by <span class="gtext">Alif</span> · Node.js · Express · TypeScript</p>
                </article>

            </div>
        </section>
    </main>

    <script>
        // Floating electrical-themed particles
        const icons = ['⚡', '🔌', '💡', '🔋', '🛠️', '🏠', '🔧', '🚀', '✨', '🤝'];
        const container = document.getElementById('particles');

        for (let i = 0; i < 22; i++) createParticle();

        function createParticle() {
            const el = document.createElement('div');
            el.classList.add('particle');
            el.innerText = icons[Math.floor(Math.random() * icons.length)];
            el.style.left = Math.random() * 100 + 'vw';
            el.style.fontSize = (Math.random() * 1.2 + 0.8) + 'rem';
            el.style.animationDuration = (Math.random() * 12 + 14) + 's';
            el.style.animationDelay = (Math.random() * 8) + 's';
            el.style.filter = 'opacity(0.35)';
            container.appendChild(el);
        }
    </script>
</body>
</html>
`;
