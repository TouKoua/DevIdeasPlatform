import { ProjectIdea, User } from '../types';

// Common programming languages
const programmingLanguages = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB',
  'HTML', 'CSS', 'SQL', 'Shell', 'PowerShell', 'Lua', 'Perl', 'Haskell'
];

// Programming skills and technologies
const programmingSkills = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask',
  'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'FastAPI',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
  'React Native', 'Flutter', 'Electron', 'Unity', 'Unreal Engine',
  'Blockchain', 'Smart Contracts', 'Web3', 'Solidity',
  'DevOps', 'CI/CD', 'Git', 'Linux', 'Microservices', 'WebSockets',
  'Testing', 'Jest', 'Cypress', 'Selenium', 'JUnit'
];

// Function to get random items from an array
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateMockUsers = (): User[] => {
  return [
    {
      id: 'user1',
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Full-stack developer passionate about creating innovative web applications. Love working with React, Node.js, and exploring new technologies.',
      location: 'San Francisco, CA',
      joinedDate: new Date('2023-01-15'),
      website: 'https://sarahchen.dev',
      github: 'sarahchen',
      twitter: 'sarahchen_dev',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user2',
      name: 'Alex Johnson',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Frontend developer with a passion for creating beautiful and intuitive user interfaces. Specializing in React and modern CSS.',
      location: 'New York, NY',
      joinedDate: new Date('2023-03-22'),
      website: 'https://alexjohnson.dev',
      github: 'alexjohnson',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user3',
      name: 'Maria Garcia',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Python developer and data scientist. Interested in machine learning, automation, and building tools that make developers more productive.',
      location: 'Austin, TX',
      joinedDate: new Date('2023-02-10'),
      github: 'mariagarcia',
      twitter: 'maria_codes',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user4',
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Senior software engineer with expertise in distributed systems and machine learning. Always excited to work on challenging technical problems.',
      location: 'Seattle, WA',
      joinedDate: new Date('2022-11-05'),
      website: 'https://davidkim.tech',
      github: 'davidkim',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user5',
      name: 'Emily Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Mobile app developer focused on React Native and Flutter. Love creating apps that solve real-world problems.',
      location: 'Los Angeles, CA',
      joinedDate: new Date('2023-04-18'),
      github: 'emilywilson',
      twitter: 'emily_mobile',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user6',
      name: 'James Smith',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Web developer and designer. Passionate about creating accessible and performant websites using modern web technologies.',
      location: 'Chicago, IL',
      joinedDate: new Date('2023-05-12'),
      website: 'https://jamessmith.design',
      github: 'jamessmith',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user7',
      name: 'Sophia Martinez',
      avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Full-stack developer with a focus on real-time applications and WebSocket technologies. Love building interactive experiences.',
      location: 'Miami, FL',
      joinedDate: new Date('2023-01-28'),
      github: 'sophiamartinez',
      twitter: 'sophia_codes',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user8',
      name: 'Daniel Brown',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Desktop application developer specializing in Electron and cross-platform development. Productivity tools enthusiast.',
      location: 'Portland, OR',
      joinedDate: new Date('2023-03-15'),
      website: 'https://danielbrown.dev',
      github: 'danielbrown',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user9',
      name: 'Olivia Taylor',
      avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Blockchain developer and security researcher. Interested in decentralized applications and smart contract development.',
      location: 'Denver, CO',
      joinedDate: new Date('2022-12-08'),
      github: 'oliviataylor',
      twitter: 'olivia_blockchain',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user10',
      name: 'Liam Johnson',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Game developer and creative coder. Love experimenting with new technologies and creating interactive experiences.',
      location: 'Boston, MA',
      joinedDate: new Date('2023-06-20'),
      github: 'liamjohnson',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user11',
      name: 'Emma Davis',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'DevOps engineer and cloud architect. Passionate about automation, infrastructure as code, and scalable systems.',
      location: 'Phoenix, AZ',
      joinedDate: new Date('2023-02-25'),
      website: 'https://emmadavis.cloud',
      github: 'emmadavis',
      savedProjects: [],
      postedProjects: []
    },
    {
      id: 'user12',
      name: 'Noah Wilson',
      avatar: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg?auto=compress&cs=tinysrgb&w=256',
      bio: 'Backend developer specializing in microservices and API design. Always looking for ways to improve system performance.',
      location: 'Nashville, TN',
      joinedDate: new Date('2023-04-03'),
      github: 'noahwilson',
      twitter: 'noah_backend',
      savedProjects: [],
      postedProjects: []
    }
  ];
};

export const generateMockProjects = (): ProjectIdea[] => {
  const mockProjects: ProjectIdea[] = [
    {
      id: 'project-1',
      title: 'Weather Dashboard with React',
      description: 'Create a weather dashboard that allows users to search for weather information by city. The dashboard should display current weather conditions, a 5-day forecast, and save recent searches.',
      difficulty: 'intermediate',
      programmingLanguages: ['JavaScript', 'HTML', 'CSS'],
      programmingSkills: ['React', 'REST API', 'Local Storage', 'Responsive Design'],
      createdAt: new Date('2023-10-15'),
      createdBy: {
        id: 'user2',
        name: 'Alex Johnson',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      upvotes: 42,
      estimatedTime: '2-3 weeks'
    },
    {
      id: 'project-2',
      title: 'Task Management CLI Tool',
      description: 'Build a command-line interface tool for managing tasks and projects. Features should include adding tasks, marking them as complete, setting priorities, and generating reports.',
      difficulty: 'beginner',
      programmingLanguages: ['Python'],
      programmingSkills: ['CLI Development', 'File I/O', 'JSON', 'Argparse'],
      createdAt: new Date('2023-11-03'),
      createdBy: {
        id: 'user3',
        name: 'Maria Garcia',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      upvotes: 28,
      estimatedTime: '1-2 weeks'
    },
    {
      id: 'project-3',
      title: 'E-commerce Product Recommendation Engine',
      description: 'Develop a recommendation engine for an e-commerce platform that suggests products based on user browsing history and purchase patterns using machine learning algorithms.',
      difficulty: 'advanced',
      programmingLanguages: ['Python', 'SQL'],
      programmingSkills: ['Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'PostgreSQL'],
      createdAt: new Date('2023-09-20'),
      createdBy: {
        id: 'user4',
        name: 'David Kim',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      upvotes: 56,
      estimatedTime: '4-6 weeks'
    },
    {
      id: 'project-4',
      title: 'Budget Tracker Mobile App',
      description: 'Create a mobile application that helps users track their expenses, set budgets, and visualize spending patterns with charts and graphs. Include features like receipt scanning and expense categorization.',
      difficulty: 'intermediate',
      programmingLanguages: ['JavaScript', 'Dart'],
      programmingSkills: ['React Native', 'Flutter', 'SQLite', 'Chart.js', 'Camera API'],
      createdAt: new Date('2023-10-25'),
      createdBy: {
        id: 'user5',
        name: 'Emily Wilson',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      upvotes: 35,
      estimatedTime: '3-4 weeks'
    },
    {
      id: 'project-5',
      title: 'Personal Portfolio Website',
      description: 'Build a responsive portfolio website to showcase your projects, skills, and experience. Include sections for about, projects, contact, and a blog using modern web technologies.',
      difficulty: 'beginner',
      programmingLanguages: ['HTML', 'CSS', 'JavaScript'],
      programmingSkills: ['Responsive Design', 'CSS Grid', 'Flexbox', 'Git', 'Web Hosting'],
      createdAt: new Date('2023-11-10'),
      createdBy: {
        id: 'user6',
        name: 'James Smith',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      upvotes: 31,
      estimatedTime: '1-2 weeks'
    },
    {
      id: 'project-6',
      title: 'Real-time Chat Application',
      description: 'Develop a real-time chat application with features like private messaging, group chats, file sharing, and message history. Implement authentication and real-time updates.',
      difficulty: 'intermediate',
      programmingLanguages: ['JavaScript', 'TypeScript'],
      programmingSkills: ['React', 'Node.js', 'WebSockets', 'Express.js', 'MongoDB', 'JWT'],
      createdAt: new Date('2023-09-15'),
      createdBy: {
        id: 'user7',
        name: 'Sophia Martinez',
        avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      upvotes: 48,
      estimatedTime: '3-4 weeks'
    },
    {
      id: 'project-7',
      title: 'Markdown Note-Taking App',
      description: 'Create a note-taking application that supports Markdown formatting, code snippets, image embedding, and organization with tags and folders. Include search functionality and cloud syncing.',
      difficulty: 'intermediate',
      programmingLanguages: ['JavaScript', 'TypeScript'],
      programmingSkills: ['Electron', 'React', 'Markdown Parser', 'File System API', 'Cloud Storage'],
      createdAt: new Date('2023-10-05'),
      createdBy: {
        id: 'user8',
        name: 'Daniel Brown',
        avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      upvotes: 39,
      estimatedTime: '2-3 weeks'
    },
    {
      id: 'project-8',
      title: 'Blockchain-based Voting System',
      description: 'Build a secure voting system using blockchain technology to ensure transparency and immutability of votes. Include voter authentication, vote verification, and result tallying.',
      difficulty: 'advanced',
      programmingLanguages: ['JavaScript', 'Solidity'],
      programmingSkills: ['Blockchain', 'Smart Contracts', 'Web3', 'Ethereum', 'Cryptography'],
      createdAt: new Date('2023-09-28'),
      createdBy: {
        id: 'user9',
        name: 'Olivia Taylor',
        avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      upvotes: 52,
      estimatedTime: '5-6 weeks'
    }
  ];

  // Generate additional random projects
  const additionalProjects = Array.from({ length: 12 }).map((_, index) => {
    const id = `project-${9 + index}`;
    const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const randomLanguages = getRandomItems(programmingLanguages, Math.floor(Math.random() * 3) + 1);
    const randomSkills = getRandomItems(programmingSkills, Math.floor(Math.random() * 4) + 2);
    const randomUpvotes = Math.floor(Math.random() * 100);
    const randomDaysAgo = Math.floor(Math.random() * 60);
    
    const users = [
      {
        id: 'user10',
        name: 'Liam Johnson',
        avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      {
        id: 'user11',
        name: 'Emma Davis',
        avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=256'
      },
      {
        id: 'user12',
        name: 'Noah Wilson',
        avatar: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg?auto=compress&cs=tinysrgb&w=256'
      }
    ];
    
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    const projectTitles = [
      'Social Media Dashboard',
      'Recipe Management App',
      'Fitness Tracker',
      'Language Learning Game',
      'IoT Home Automation System',
      'Music Streaming Service',
      'Multiplayer Card Game',
      'Employee Management System',
      'Stock Market Analyzer',
      'Content Management System',
      'Event Planning Platform',
      'E-Learning Portal'
    ];
    
    return {
      id,
      title: projectTitles[index],
      description: `A project idea for building ${projectTitles[index].toLowerCase()} using modern technologies. This project will help developers improve their skills in ${randomSkills.join(', ')}.`,
      difficulty: randomDifficulty,
      programmingLanguages: randomLanguages,
      programmingSkills: randomSkills,
      createdAt: new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000),
      createdBy: randomUser,
      upvotes: randomUpvotes,
      estimatedTime: `${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 4) + 2} weeks`
    };
  });

  return [...mockProjects, ...additionalProjects];
};