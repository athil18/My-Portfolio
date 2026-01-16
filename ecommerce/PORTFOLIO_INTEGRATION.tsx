/* 
  📋 PORTFOLIO INTEGRATION SNIPPET
  
  Since I cannot directly access your external 'Portfolio-master' folder, 
  I have generated this professional entry for you. 

  👉 INSTRUCTIONS:
  1. Open your main portfolio project code.
  2. Locate your 'Projects', 'Portfolio', or 'Work' data file (often 'projects.js' or inside a component).
  3. Copy the object below and add it to your project list.
  4. Ensure you copy 'logo.png' from this project's frontend/public folder to your portfolio's assets.
*/

export const mhdCommerceProject = {
    id: "mhd-commerce",
    title: "MHD Commerce",
    category: "Full Stack",
    tagline: "A premium, secure e-commerce platform with glassmorphism UI.",
    description: "A comprehensive e-commerce solution built with the MERN stack, featuring a high-end Glassmorphism design system, secure JWT authentication with refresh rotation, and a custom demo payment flow. It includes a full admin dashboard, real-time inventory tracking, and a seamless checkout experience.",
    image: "/assets/projects/mhd-commerce-preview.png",
    logo: "/assets/projects/mhd-logo.png",
    techStack: [
        { name: "React 19", icon: "react", color: "#61DAFB" },
        { name: "TypeScript", icon: "typescript", color: "#3178C6" },
        { name: "Tailwind CSS v4", icon: "tailwind", color: "#38B2AC" },
        { name: "Node.js", icon: "nodejs", color: "#339933" },
        { name: "MongoDB", icon: "mongodb", color: "#47A248" },
        { name: "Stripe", icon: "stripe", color: "#635BFF" },
    ],
    features: [
        "🎨 Custom Glassmorphism UI System",
        "🔒 Private Store with JWT + HttpOnly Auth",
        "💳 One-Click Demo Payment Integration",
        "📊 Comprehensive Admin Dashboard",
        "🛒 Persistent Cart & Order History"
    ],
    links: {
        github: "https://github.com/your-username/mhd-commerce",
        demo: "https://mhd-commerce-demo.vercel.app",
    },
    priority: 2,
};
