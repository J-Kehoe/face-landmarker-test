export function PointFace(props: any) {
    console.log("rendering points")
    return (
        <group {...props} dispose={null}>
          {props.keypoints.map((keypoint: any, index: number) => {
            return (
              <mesh key={index} position={[keypoint.x * (props.width/1000), -keypoint.y * (props.height/1000), 0]}>
                <sphereGeometry args={[0.005, 32, 32]} />
                <meshStandardMaterial color="red" />
              </mesh>
            );
          })}
        </group>
      );
}