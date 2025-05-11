
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Box Component
const Box = ({ position, size = [1, 1, 1], color = "#00a3ff" }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Animasi berputar
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
    }
  });
  
  return (
    <mesh ref={mesh} position={position as [number, number, number]}>
      <boxGeometry args={size as [number, number, number]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Torus Component
const Torus = ({ position, args = [1, 0.4, 16, 100], color = "#ff0066" }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
    }
  });
  
  return (
    <mesh ref={mesh} position={position as [number, number, number]}>
      <torusGeometry args={args as [number, number, number, number]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Floating Text Component
const FloatingText = ({ text, position, color = "#ffffff", size = 1 }) => {
  const textRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  
  useFrame(({ clock }) => {
    if (textRef.current) {
      textRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime()) * 0.2;
      if (hover) {
        textRef.current.rotation.y += 0.02;
      }
    }
  });
  
  return (
    <Text
      ref={textRef}
      position={position as [number, number, number]}
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY="middle"
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {text}
    </Text>
  );
};

// Sphere Component
const Sphere = ({ position, args = [1, 32, 32], color = "#6a0dad" }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.01;
      mesh.current.scale.x = mesh.current.scale.y = mesh.current.scale.z = 
        hover ? 1.2 : 1;
    }
  });
  
  return (
    <mesh 
      ref={mesh} 
      position={position as [number, number, number]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={args as [number, number, number]} />
      <meshPhongMaterial color={color} />
    </mesh>
  );
};

// Light Component
const Lighting = ({ position = [10, 10, 10] }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  useHelper(lightRef, THREE.DirectionalLightHelper, 5);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        ref={lightRef}
        position={position as [number, number, number]} 
        intensity={1} 
        castShadow 
      />
    </>
  );
};

// 3D Logo Component for Header
export const Logo3D: React.FC<{ size?: number }> = ({ size = 50 }) => {
  return (
    <div style={{ height: size, width: size * 3 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Lighting />
        <Sphere position={[-2, 0, 0]} args={[0.6, 16, 16]} color="#00bfa6" />
        <Box position={[0, 0, 0]} size={[0.8, 0.8, 0.8]} color="#f97316" />
        <Torus position={[2, 0, 0]} args={[0.6, 0.2, 16, 50]} color="#8b5cf6" />
        <Text 
          position={[0, -1.2, 0]} 
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          TanoeLuis
        </Text>
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={3}
        />
      </Canvas>
    </div>
  );
};

interface Canvas3DProps {
  className?: string;
  height?: string;
}

export const Canvas3D: React.FC<Canvas3DProps> = ({ 
  className = "h-96",
  height = "400px"
}) => {
  return (
    <div className={className} style={{ height }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
      >
        <Lighting />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        
        <Box position={[-4, 0, 0]} />
        <Torus position={[0, 0, -2]} />
        <Sphere position={[4, 0, 0]} />
        
        <FloatingText 
          text="TanoeLuis" 
          position={[0, 3, 0]} 
          color="#00bcd4"
          size={1.5}
        />
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

// Character untuk Hero Section
export const Character3D: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("h-[500px]", className)}>
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        
        {/* Karakter Robot 3D */}
        <group position={[0, -2, 0]}>
          {/* Kepala */}
          <mesh position={[0, 4, 0]}>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial color="#8b5cf6" />
            
            {/* Mata */}
            <mesh position={[0.4, 0.2, 0.76]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#00fff2" emissive="#00fff2" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.4, 0.2, 0.76]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#00fff2" emissive="#00fff2" emissiveIntensity={0.5} />
            </mesh>
            
            {/* Antena */}
            <mesh position={[0.5, 0.9, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.5]} />
              <meshStandardMaterial color="#f97316" />
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#ff0066" emissive="#ff0066" emissiveIntensity={0.5} />
              </mesh>
            </mesh>
            <mesh position={[-0.5, 0.9, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.5]} />
              <meshStandardMaterial color="#f97316" />
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#ff0066" emissive="#ff0066" emissiveIntensity={0.5} />
              </mesh>
            </mesh>
          </mesh>
          
          {/* Badan */}
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[2.5, 2, 1]} />
            <meshStandardMaterial color="#3b82f6" />
            
            {/* Panel di dada */}
            <mesh position={[0, 0.4, 0.51]}>
              <boxGeometry args={[1.5, 0.8, 0.1]} />
              <meshStandardMaterial color="#334155" />
              
              {/* Lampu-lampu panel */}
              <mesh position={[-0.4, 0.2, 0.06]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[0, 0.2, 0.06]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[0.4, 0.2, 0.06]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
              </mesh>
            </mesh>
          </mesh>
          
          {/* Lengan kiri */}
          <group position={[-1.6, 2.5, 0]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.3, 0.35, 1.8]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, -1, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>
          
          {/* Lengan kanan */}
          <group position={[1.6, 2.5, 0]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.3, 0.35, 1.8]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
            <mesh position={[0, -1, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>
          
          {/* Kaki */}
          <group position={[-0.6, 0.8, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.4, 1.5]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, -0.9, 0.1]}>
              <boxGeometry args={[0.8, 0.3, 1.2]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
          
          <group position={[0.6, 0.8, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.4, 1.5]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, -0.9, 0.1]}>
              <boxGeometry args={[0.8, 0.3, 1.2]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        </group>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

// Komponen Hero 3D
interface Hero3DProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Hero3D: React.FC<Hero3DProps> = ({
  title = "Selamat Datang di TanoeLuis",
  subtitle = "Platform kreasi web development Indonesia",
  className
}) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Character3D />
      
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background to-transparent">
        <div className="text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"
          >
            {title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-4 text-xl text-muted-foreground max-w-lg mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </div>
  );
};
