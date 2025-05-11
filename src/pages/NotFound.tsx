
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl text-center space-y-8">
        {/* Animated 404 Text */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.h1 
            className="text-[150px] sm:text-[200px] font-bold text-primary/10"
            animate={{ 
              y: [0, -10, 0, -5, 0],
              rotateZ: [0, -1, 0, 1, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            404
          </motion.h1>
          
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Page Not Found</h2>
          </motion.div>
        </motion.div>
        
        <motion.p 
          className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          The page you're looking for doesn't exist or has been moved.
          {location.pathname && (
            <span className="block mt-2 font-mono text-sm bg-secondary/50 p-2 rounded">
              {location.pathname}
            </span>
          )}
        </motion.p>

        <motion.div 
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button 
            variant="default" 
            size="lg"
            onClick={goBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          
          <Link to="/">
            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center gap-2"
            >
              <Home size={18} />
              Return to Home
            </Button>
          </Link>
          
          <Link to="/search">
            <Button 
              variant="ghost" 
              size="lg"
              className="flex items-center gap-2"
            >
              <Search size={18} />
              Search Website
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-sm text-muted-foreground mt-8"
        >
          <p>Looking for something specific? Try navigating using the menu or contact support.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
