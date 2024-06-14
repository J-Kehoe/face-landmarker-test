import { OrbitControls, Stats, Environment } from "@react-three/drei";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { CanonFace } from "./assets/CanonFace";
import { useEffect, useState } from "react";
import * as MediaPipe from "@mediapipe/tasks-vision";
import { useControls } from "leva";
import { TextureLoader } from "three";
import { PointFace } from "./assets/PointFace";

function isEmptyObject(obj: any): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function App() {
  const [landmarker, setLandmarker] = useState({});
  const [photo, setPhoto] = useState({});
  const [loading, setLoading] = useState(false);
  const { torusVisible, focusPoint, numVisible } = useControls({
    torusVisible: true,
    focusPoint: {
      value: 0,
      min: 0,
      max: 468,
      step: 1,
    },
    numVisible: true
  });
  const [keypoints, setKeypoints] = useState([]);
  const [texture, setTexture] = useState({});
  // const [textureTwo, setTextureTwo] = useState({});
  const loader = new TextureLoader();

  function loadLandmarker() {
    console.log("Creating Landmarker");
    MediaPipe.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    ).then((fileset) => {
      MediaPipe.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU",
        },
        outputFaceBlendshapes: false,
        runningMode: "IMAGE",
        numFaces: 1,
        outputFacialTransformationMatrixes: true
      }).then((landmarker: MediaPipe.FaceLandmarker) => {
        setLandmarker(landmarker);
        console.log("Created Landmarker", landmarker);
      });
    });
  }

  useEffect(() => {
    if (!isEmptyObject(photo) && isEmptyObject(landmarker)) {
      console.log("photo, no landmarker");
      setLoading(true);
      return;
    }
    if (!isEmptyObject(landmarker) && isEmptyObject(photo)) {
      console.log("landmarker, no photo");
      return;
    }

    if (!isEmptyObject(landmarker) && !isEmptyObject(photo)) {
      console.log("landmarker, photo");
      setLoading(true);
      // @ts-ignore
      const faceLandmarkerResult = landmarker.detect(photo);
      console.log("FaceLandmarkerResult", faceLandmarkerResult);
      console.log(
        "keypoints length",
        faceLandmarkerResult.faceLandmarks[0].length
      );
      setKeypoints(faceLandmarkerResult.faceLandmarks[0]);
      setLoading(false);
    }
  }, [landmarker, photo]);

  return (
    <>
      <p>Loading: {loading ? "true" : "false"}</p>
      {/* @ts-ignore */}
      <img src={photo.src} alt="Photo" style={{ height: "20px" }} />
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                img.height = 500
                img.width = 500
                setPhoto(img);
                setTexture(loader.load(img.src));
                // setTextureTwo(loader.load('./canonical_face_model_uv_visualization.png'))
              };
              img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
            console.log("File", file);
          }
        }}
      />
      <button onClick={loadLandmarker}>Landmarker</button>
      <Canvas
        style={{
          width: "640px",
          height: "480px",
          border: "5px solid black",
          backgroundColor: "white",
          margin: "10px",
        }}
      >
        <axesHelper />
        <Stats />
        <OrbitControls />
        <directionalLight position={[10, 0, 10]} />
        <ambientLight />
        <Environment preset="forest" background />
        <mesh position={[-1.5, 0, 0]} visible={torusVisible}>
          <torusGeometry />
          <meshStandardMaterial color="hotpink" />
        </mesh>

        {keypoints.length !== 0 && (
          <>
            <CanonFace
              position={[1.5, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              /* @ts-ignore */
              map={photo.src || null}
              keypoints={keypoints}
              visible={torusVisible}
              focusPoint={focusPoint}
              numVisible={numVisible}
            />
            {/* @ts-ignore  */}
            {/* <PointFace
              keypoints={keypoints}

              position={[-(photo.width / 1000) / 2, photo.height / 1000 / 2, 0]}

              width={photo.width}

              height={photo.height}
              multiplier={aNumber}
            /> */}
            <mesh position={[0.5, 0.5, 0]}>

              <planeGeometry args={[1, 1]} />
              {/* @ts-ignore */}
              <meshStandardMaterial map={texture} />
            </mesh>
          </>
        )}
      </Canvas>
    </>
  );
}

export default App;
