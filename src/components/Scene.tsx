import { Canvas } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import Mountain from './Mountain';
import DistantRidge from './DistantRidge';
import Routes from './Routes';
import Skier from './Skier';
import Snow from './Snow';
import CameraRig from './CameraRig';

interface SceneProps {
  scrollProgress: MotionValue<number>;
  activeRoute: number | null;
}

// Fixed full-screen 3D backdrop. The page content scrolls above it.
export default function Scene({ scrollProgress, activeRoute }: SceneProps) {
  return (
    <div className="scene">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 4.5, 26], fov: 42, near: 0.1, far: 90 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#040a16']} />
        <fog attach="fog" args={['#040a16', 14, 48]} />

        {/* Cold ambient fill, one "moon" key light, one blue rim light */}
        <ambientLight intensity={0.4} color="#3a5a8c" />
        <directionalLight position={[6, 14, 5]} intensity={1.5} color="#dceaff" />
        <directionalLight position={[-10, 4, -8]} intensity={0.6} color="#2e4a7a" />

        <Mountain />
        <DistantRidge />
        <Routes activeRoute={activeRoute} />
        <Skier />
        <Snow />
        <CameraRig scrollProgress={scrollProgress} activeRoute={activeRoute} />
      </Canvas>
    </div>
  );
}
