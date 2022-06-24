import fragmentShader from "!raw-loader!./shaders/gridplane.frag"
import vertexShader from "!raw-loader!./shaders/gridplane.vert"
import * as THREE from "three"

export class Superplane extends THREE.Object3D {

    
    targetplane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

    uniforms= {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(1, 1, 1) },
        iColor: { value: new THREE.Vector3((1.0 / 255.0 * 28.0), 1.0 / 255.0 * 167.0, 1.0 / 255.0 * 232.0) }
    };

    constructor() {
        super()

        const uniforms=this.uniforms
        const params:THREE.ShaderMaterialParameters={
            vertexShader,
            fragmentShader,
            uniforms,
        }
        var shadermaterial = new THREE.ShaderMaterial(params);
        shadermaterial.transparent = true;
        shadermaterial.side = THREE.DoubleSide;
        shadermaterial.depthWrite = false;
        shadermaterial.depthTest = true;
        shadermaterial.blending = THREE.CustomBlending;
        shadermaterial.blendDst = THREE.OneFactor;
        //blendDstAlpha: THREE.OneMinusSrcColorFactor,
        shadermaterial.blendSrc = THREE.OneFactor;
        //blendSrcAlpha: THREE.OneFactor,
        shadermaterial.blendEquation = THREE.AddEquation;

        const pgeometry = new THREE.PlaneGeometry(10, 10);
        const pmaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        this.targetplane = new THREE.Mesh(pgeometry, shadermaterial);
        this.targetplane.position.set(0, 0, 0.0002)
        this.add(this.targetplane)
    }

    setColor(color:THREE.Color){
        this.uniforms.iColor.value=new THREE.Vector3(color.r,color.g,color.b)
    }


}