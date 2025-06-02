import { ProjectIdea } from '../types';

// List of common programming project tags
const projectTags = [
  'web', 'mobile', 'desktop', 'game', 'api',
  'fullstack', 'frontend', 'backend', 'database',
  'ai', 'machine-learning', 'blockchain', 'iot',
  'react', 'vue', 'angular', 'node', 'python',
  'javascript', 'typescript', 'css', 'html', 'aws',
  'cloud', 'devops', 'security', 'data-science'
];

// Function to get random items from an array
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateMockProjects = (): ProjectIdea[] => {
  const mockProjects: ProjectIdea[] = [
    {
      id: 'project-1',
      title: 'Weather Dashboard with React',
      description: 'Create a weather dashboard that allows users to search for weather information by city. The dashboard should display current weather conditions, a 5-day forecast, and save recent searches.',
      difficulty: 'intermediate',
      tags: ['web', 'frontend', 'react', 'api'],
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
      tags: ['cli', 'python', 'productivity'],
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
      tags: ['machine-learning', 'python', 'data-science', 'e-commerce'],
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
      tags: ['mobile', 'react-native', 'finance', 'app'],
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
      tags: ['web', 'frontend', 'html', 'css', 'javascript'],
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
      tags: ['web', 'fullstack', 'websockets', 'react', 'node'],
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
      tags: ['desktop', 'electron', 'javascript', 'productivity'],
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
      tags: ['blockchain', 'security', 'web3', 'solidity'],
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
    const randomTags = getRandomItems(projectTags, Math.floor(Math.random() * 5) + 1);
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
      description: `A project idea for building ${projectTitles[index].toLowerCase()} using modern technologies. This project will help developers improve their skills in ${randomTags.join(', ')}.`,
      difficulty: randomDifficulty,
      tags: randomTags,
      createdAt: new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000),
      createdBy: randomUser,
      upvotes: randomUpvotes,
      estimatedTime: `${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 4) + 2} weeks`
    };
  });

  return [...mockProjects, ...additionalProjects];
};