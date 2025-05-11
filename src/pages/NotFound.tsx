
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ArrowLeft, 
  Search, 
  AlertCircle,
  RefreshCw
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log the 404 error
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Generate helpful suggestions based on the current path
    const path = location.pathname.toLowerCase();
    const newSuggestions = [];
    
    if (path.includes("blog")) {
      newSuggestions.push("/blog");
    } else if (path.includes("template")) {
      newSuggestions.push("/templates");
    } else if (path.includes("tool")) {
      newSuggestions.push("/tools");
    } else if (path.includes("chat")) {
      newSuggestions.push("/tools/ai-chat");
    } else if (path.includes("dashboard")) {
      newSuggestions.push("/dashboard");
    }
    
    // Always add these common paths
    if (!newSuggestions.includes("/blog")) newSuggestions.push("/blog");
    if (!newSuggestions.includes("/templates")) newSuggestions.push("/templates");
    
    setSuggestions(newSuggestions);
  }, [location.pathname]);

  const goBack = () => {
    navigate(-1);
  };
  
  const reloadPage = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Halaman Tidak Ditemukan</h2>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p>Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
          {location.pathname && (
            <div className="mt-2">
              <div className="flex items-center justify-center gap-2 font-mono text-sm bg-secondary/50 p-2 rounded">
                <AlertCircle size={16} className="text-orange-500" />
                <span>{location.pathname}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground mb-3">Mungkin Anda mencari:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((path, index) => (
                  <Button 
                    key={path} 
                    variant="outline" 
                    size="sm"
                    asChild
                    className="hover:bg-primary/10"
                  >
                    <Link to={path}>{path}</Link>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            Kembali
          </Button>
          
          <Link to="/">
            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center gap-2"
            >
              <Home size={18} />
              Kembali ke Beranda
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="lg"
            onClick={reloadPage}
            className="flex items-center gap-2"
            disabled={isRetrying}
          >
            <RefreshCw size={18} className={isRetrying ? "animate-spin" : ""} />
            {isRetrying ? "Memuat ulang..." : "Coba Lagi"}
          </Button>
          
          <Link to="/search">
            <Button 
              variant="ghost" 
              size="lg"
              className="flex items-center gap-2"
            >
              <Search size={18} />
              Cari di Situs
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-sm text-muted-foreground mt-8"
        >
          <p>Mencari sesuatu? Coba navigasi menggunakan menu atau hubungi kami melalui tombol chat.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
