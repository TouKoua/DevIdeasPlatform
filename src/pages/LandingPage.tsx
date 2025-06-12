import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon,
  CodeIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  StarIcon,
  ChevronDownIcon,
  PlayIcon,
  PlusSquareIcon,
  SearchIcon,
  ThumbsUpIcon,
  ZapIcon,
  LightbulbIcon,
  RocketIcon,
  HeartIcon,
  BookOpenIcon,
  GithubIcon,
  ShareIcon
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { projects, currentUser } = useProjects();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Introduction slides about the website
  const introSlides = [
    {
      id: 'welcome',
      title: 'Welcome to CodeIdeas',
      subtitle: 'Where Great Projects Begin',
      description: 'Discover your next coding adventure with thousands of project ideas from developers around the world.',
      icon: <RocketIcon size={64} className="text-white mb-6" />,
      gradient: 'from-indigo-600 via-purple-600 to-pink-600'
    },
    {
      id: 'discover',
      title: 'Discover & Explore',
      subtitle: 'Find Your Perfect Project',
      description: 'Browse through curated project ideas across all skill levels and technologies. From beginner-friendly tutorials to advanced challenges.',
      icon: <SearchIcon size={64} className="text-white mb-6" />,
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600'
    },
    {
      id: 'share',
      title: 'Share Your Ideas',
      subtitle: 'Inspire the Community',
      description: 'Have a brilliant project idea? Share it with thousands of developers and help others learn and grow.',
      icon: <LightbulbIcon size={64} className="text-white mb-6" />,
      gradient: 'from-amber-600 via-orange-600 to-red-600'
    },
    {
      id: 'collaborate',
      title: 'Build Together',
      subtitle: 'Connect & Collaborate',
      description: 'Find collaborators for your projects, get feedback from the community, and turn ideas into reality.',
      icon: <UsersIcon size={64} className="text-white mb-6" />,
      gradient: 'from-violet-600 via-purple-600 to-indigo-600'
    },
    {
      id: 'grow',
      title: 'Grow Your Skills',
      subtitle: 'Level Up Your Development',
      description: 'Challenge yourself with new technologies, learn from others, and build an impressive portfolio of projects.',
      icon: <TrendingUpIcon size={64} className="text-white mb-6" />,
      gradient: 'from-rose-600 via-pink-600 to-purple-600'
    }
  ];

  // Navigation functions
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % introSlides.length);
  }, [introSlides.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + introSlides.length) % introSlides.length);
  }, [introSlides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    // Reset auto-advance timer when user manually navigates
    setAutoAdvance(false);
    setTimeout(() => setAutoAdvance(true), 8000); // Resume auto-advance after 8 seconds
  }, []);

  const handleArrowNavigation = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next') {
      goToNextSlide();
    } else {
      goToPrevSlide();
    }
    // Reset auto-advance timer when user manually navigates
    setAutoAdvance(false);
    setTimeout(() => setAutoAdvance(true), 8000); // Resume auto-advance after 8 seconds
  }, [goToNextSlide, goToPrevSlide]);

  // Auto-advance slideshow
  useEffect(() => {
    if (!autoAdvance) return;

    const timer = setInterval(() => {
      goToNextSlide();
    }, 4000);

    return () => clearInterval(timer);
  }, [autoAdvance, goToNextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handleArrowNavigation('prev');
      } else if (event.key === 'ArrowRight') {
        handleArrowNavigation('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleArrowNavigation]);

  const stats = [
    {
      icon: <CodeIcon size={24} className="text-indigo-600" />,
      value: projects.length.toLocaleString(),
      label: 'Project Ideas',
      description: 'Ready to inspire your next build'
    },
    {
      icon: <UsersIcon size={24} className="text-emerald-600" />,
      value: '12K+',
      label: 'Developers',
      description: 'Active community members'
    },
    {
      icon: <ThumbsUpIcon size={24} className="text-amber-600" />,
      value: '50K+',
      label: 'Upvotes',
      description: 'Community engagement'
    },
    {
      icon: <StarIcon size={24} className="text-purple-600" />,
      value: '95%',
      label: 'Success Rate',
      description: 'Projects completed successfully'
    }
  ];

  const features = [
    {
      icon: <SearchIcon size={32} className="text-indigo-600" />,
      title: 'Discover Projects',
      description: 'Browse thousands of project ideas across all programming languages and skill levels.',
      color: 'bg-indigo-50 border-indigo-200'
    },
    {
      icon: <PlusSquareIcon size={32} className="text-emerald-600" />,
      title: 'Share Ideas',
      description: 'Post your own project ideas and help inspire the next generation of developers.',
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      icon: <UsersIcon size={32} className="text-purple-600" />,
      title: 'Find Collaborators',
      description: 'Connect with other developers and work together on exciting projects.',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      icon: <TrendingUpIcon size={32} className="text-amber-600" />,
      title: 'Track Trends',
      description: 'Stay up-to-date with the latest technologies and trending project ideas.',
      color: 'bg-amber-50 border-amber-200'
    },
    {
      icon: <BookOpenIcon size={32} className="text-rose-600" />,
      title: 'Learn & Grow',
      description: 'Expand your skills with projects designed for continuous learning.',
      color: 'bg-rose-50 border-rose-200'
    },
    {
      icon: <HeartIcon size={32} className="text-pink-600" />,
      title: 'Community Driven',
      description: 'Join a supportive community of developers passionate about building great software.',
      color: 'bg-pink-50 border-pink-200'
    }
  ];

  const categories = [
    {
      name: 'Web Development',
      count: projects.filter(p => 
        p.programmingLanguages.some(lang => ['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(lang))
      ).length,
      icon: <CodeIcon size={20} />,
      color: 'bg-blue-500'
    },
    {
      name: 'Mobile Apps',
      count: projects.filter(p => 
        p.programmingSkills.some(skill => ['React Native', 'Flutter', 'Swift', 'Kotlin'].includes(skill))
      ).length,
      icon: <ZapIcon size={20} />,
      color: 'bg-green-500'
    },
    {
      name: 'Machine Learning',
      count: projects.filter(p => 
        p.programmingSkills.some(skill => ['Machine Learning', 'TensorFlow', 'PyTorch'].includes(skill))
      ).length,
      icon: <TrendingUpIcon size={20} />,
      color: 'bg-purple-500'
    },
    {
      name: 'Beginner Friendly',
      count: projects.filter(p => p.difficulty === 'beginner').length,
      icon: <StarIcon size={20} />,
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section with Introduction Slideshow */}
      <section className="relative overflow-hidden h-screen">
        {/* Sliding Container */}
        <div 
          className="flex h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {introSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="w-full h-full flex-shrink-0"
            >
              <div className={`h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center relative`}>
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Content */}
                <div className="relative z-20 text-center text-white px-4 max-w-6xl mx-auto">
                  {slide.icon}
                  
                  <Badge variant="primary" size="lg" className="mb-6 bg-white/20 text-white border-white/30">
                    {slide.subtitle}
                  </Badge>
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  
                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
                    {slide.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    {currentUser ? (
                      <>
                        <Link to="/">
                          <Button variant="secondary" size="lg" icon={<SearchIcon size={20} />}>
                            Explore Projects
                          </Button>
                        </Link>
                        <Link to="/new-project">
                          <Button variant="outline" size="lg" icon={<PlusSquareIcon size={20} />} 
                                className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                            Share Your Idea
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/signup">
                          <Button variant="secondary" size="lg" icon={<RocketIcon size={20} />}>
                            Join the Community
                          </Button>
                        </Link>
                        <Link to="/">
                          <Button variant="outline" size="lg" icon={<SearchIcon size={20} />} 
                                className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                            Browse Projects
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => handleArrowNavigation('prev')}
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-40 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon size={24} className="text-white group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => handleArrowNavigation('next')}
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-40 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
          aria-label="Next slide"
        >
          <ArrowRightIcon size={24} className="text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex space-x-2">
          {introSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-8 z-40 animate-bounce">
          <ChevronDownIcon size={32} className="text-white/70" />
        </div>

        {/* Auto-advance indicator */}
        {!autoAdvance && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white text-sm">Auto-advance paused</span>
          </div>
        )}
      </section>

      {/* What is CodeIdeas Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What is CodeIdeas?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              CodeIdeas is a vibrant community platform where developers share, discover, and collaborate on 
              programming project ideas. Whether you're a beginner looking for your first project or an 
              experienced developer seeking inspiration, we've got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`p-6 rounded-2xl border-2 ${feature.color} group hover:shadow-lg transition-all duration-300`}>
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Join a Thriving Community
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Be part of a growing ecosystem of developers who are passionate about building amazing projects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with CodeIdeas is simple and straightforward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6 group-hover:bg-indigo-200 transition-colors duration-300">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign Up & Explore</h3>
              <p className="text-gray-600 leading-relaxed">
                Create your free account and start browsing thousands of project ideas across all skill levels and technologies.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6 group-hover:bg-emerald-200 transition-colors duration-300">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Find & Save Projects</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover projects that match your interests, save your favorites, and upvote the ideas you love most.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Build & Share</h3>
              <p className="text-gray-600 leading-relaxed">
                Start building your chosen project, share your progress, and inspire others with your own creative ideas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore projects across different domains and find what excites you most
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                to="/"
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${category.color} rounded-xl text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.count} projects available</p>
                <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700">
                  Explore <ArrowRightIcon size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building amazing projects and growing their skills. 
            Your next great project idea is waiting for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentUser ? (
              <>
                <Link to="/">
                  <Button variant="secondary" size="lg" icon={<SearchIcon size={20} />}>
                    Start Exploring
                  </Button>
                </Link>
                <Link to="/new-project">
                  <Button variant="outline" size="lg" icon={<PlusSquareIcon size={20} />} 
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                    Share Your Idea
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="secondary" size="lg" icon={<RocketIcon size={20} />}>
                    Join the Community
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg" icon={<SearchIcon size={20} />} 
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                    Browse Projects
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;