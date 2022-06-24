import { BufferGeometry, Curve, Float32BufferAttribute, LineBasicMaterial, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three";
import * as THREE from "three"
import fragmentShader from "!raw-loader!./shaders/line.frag"
import vertexShader from "!raw-loader!./shaders/line.vert"

export class Mimic extends Object3D {
    boxmesh: Mesh<any, MeshBasicMaterial>;
    mmesh: Mesh<any, MeshBasicMaterial>;
    positions: any;
    clock = new THREE.Clock()
    group: THREE.Group;
    ms = new Map<Vector3, BufferGeometry>()
    mc = new Map<Vector3, THREE.Line>()
    mo = new Map<Vector3, any>();

    linematerial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 30 });

    shaderMaterial: THREE.ShaderMaterial;
    uniforms: { thickness: { type: string; value: number; }; opacity: { type: string; value: number; }; diffuse: { type: string; value: THREE.Color; }; };
    anchors: Vector3[] = []
    constructor(anschors: Vector3[]) {
        super()

        const box = new THREE.SphereBufferGeometry(0.05);
        const boxmesh = new Mesh(box, new MeshBasicMaterial({ color: 0x000000 }))
        this.add(boxmesh)

        anschors.forEach(a=>{

                this.anchors.push(a.clone())
                for(var i=0;i<3;i++){
                this.anchors.push(a.clone().add(new Vector3(Math.random()*0.2-0.1,Math.random()*0.2-0.1,0)))
            }

        })

        this.boxmesh = boxmesh
        const positions: number[] = [];
        const offsets: number[] = [];
        const colors: number[] = [];

        const crazyGeo = new THREE.BoxBufferGeometry(2, 2, 4, 4)
        const crayyMesh = new Mesh(crazyGeo, new MeshBasicMaterial({ color: 0x303030 }))
        //this.add(crayyMesh)
        this.mmesh = crayyMesh
        this.positions = (crazyGeo.attributes as any).position;
        this.positions.usage = THREE.DynamicDrawUsage;

        const curve = new THREE.CubicBezierCurve3(
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
            new Vector3(1, 1, 0),
        );
        const points2 = curve.getPoints(50);
        const points = [];
        //points.push(new THREE.Vector3(loc1.x, loc1.y, loc1.z));
        //points.push(new THREE.Vector3(loc2.x, loc2.y, loc2.z));//pos.x, pos.y, pos.z));
        const geometry = new THREE.BufferGeometry().setFromPoints(points2);
        const linematerial = new THREE.LineBasicMaterial({ color: 0xef90ff });
        const curveObject = new THREE.Line(geometry, linematerial);
        //curveObject.layers.enable(8);
        //this.add(curveObject);
        //this.geo = geometry;

        const instanceCount = 200
        const geometry2 = new THREE.InstancedBufferGeometry();
        geometry2.instanceCount = instanceCount;
        geometry2.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry2.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
        geometry2.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4));

        const mesh = new Mesh(geometry2, new MeshBasicMaterial({ color: 0x0000ff }))
        //    this.add(mesh)

        this.group = new THREE.Group();
        this.add(this.group)

        var thickness = 10.2;
        var opacity = 1.0;
        var diffuse = 0x000000;

        this.uniforms = {

            thickness: { type: 'f', value: thickness },
            opacity: { type: 'f', value: opacity },
            diffuse: { type: 'c', value: new THREE.Color(diffuse) }

        };

        this.shaderMaterial = new THREE.ShaderMaterial({

            uniforms: this.uniforms,
            //            attributes: this.attributes,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
//            blending: THREE.AdditiveBlending,
            depthTest: true,
  //          transparent: true

        });

        this.shaderMaterial.linewidth = 1;

    }

    update(position: Vector3): void {

        //this.geo.setDrawRange(25,10)
        //console.log(position)
        this.boxmesh.position.copy(position)
        this.boxmesh.matrixWorldNeedsUpdate = true
        this.mmesh.position.copy(position)
        //        console.log(this.boxmesh.position)
        this.boxmesh.matrixAutoUpdate = true
        this.matrixWorldNeedsUpdate = true

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime() * 10;
        //        this.group.clear()

        const mdd=0.9
        
        this.anchors.forEach(a => {
            var d = a.distanceTo(this.boxmesh.position)
            const moa=this.mo.get(a)
            var md=mdd
            if(moa){
                md+=moa.dist
            }
            if (d < md) {
                if (!this.ms.has(a)) {
                    const curve = new THREE.CubicBezierCurve3(
                        a,
                        new Vector3(a.x, a.y, 0.5),
                        new Vector3(this.boxmesh.position.x, this.boxmesh.position.y, 0.2),
                        this.boxmesh.position,
                    );
                    const points2 = [];
                    const points = [];
                    points2.push(new Vector3(a.x,a.y+.002,a.z))
                    //points2.push(new Vector3(a.x+.002,a.y+.02,a.z))
                    const points3=points2.concat(curve.getPoints(20))
                    //points.push(new THREE.Vector3(loc1.x, loc1.y, loc1.z));
                    //points.push(new THREE.Vector3(loc2.x, loc2.y, loc2.z));//pos.x, pos.y, pos.z));
                    const geometry = new THREE.BufferGeometry().setFromPoints(points3);
                    this.ms.set(a, geometry)

                    const curveObject = new THREE.Line(geometry, this.linematerial);
                    const arr = [3,0.2,3,2,3,4,2]
                    geometry.setAttribute("thickness", new THREE.Float32BufferAttribute(arr,50));

                    geometry.setDrawRange(0,0)
                    this.group.add(curveObject)
                    this.mc.set(a, curveObject)
                    this.mo.set(a,{ dist:Math.random()*0.6,erand: Math.random()*0.06-0.03, orand: Math.random()*0.04-0.02})
                } else {

                    const curve = new THREE.CubicBezierCurve3(
                        a,
                        new Vector3(a.x, a.y, 0.2),
                        new Vector3(this.boxmesh.position.x, this.boxmesh.position.y, 0.2),
                        this.boxmesh.position,
                    );
                    const points2 = [];
                    const points = [];
                    const erand = this.mo.get(a).erand;
                    const orand = this.mo.get(a).erand;
                    points2.push(new Vector3(a.x,a.y+erand,a.z))
                    points2.push(new Vector3(a.x+erand,a.y+erand,a.z))
                    //points2.push(new Vector3(a.x+.2,a.y+.02,a.z))
                    const points3=points2.concat(curve.getPoints(20))
                    const e = this.ms.get(a)
                    points3.forEach((p,i)=>{
                        p.z+=Math.sin(Math.PI/20*i)*orand
                    } )
                    if (e) {
                        e.setFromPoints(points3)
                    }
                }

                const e = this.ms.get(a)
                if (e) {
                    const minr = 0.9*md
                    const maxr = 1*md
                    const dd = Math.max(0, 22 / (maxr-minr) * (d-minr));
                    
                    e.setDrawRange(dd,22)
                }

            } else {
                if (this.ms.has(a)) {
                    const e = this.ms.get(a)
                    const ee = this.mc.get(a)
                    if (e && ee) {
                        this.group.remove(ee)
                        this.ms.delete(a)
                        this.mc.delete(a)
                    }
                }
            }
        })


        const positions = this.positions;

        for (let i = 0; i < positions.count; i++) {

            const y = 0.35 * Math.sin(i / 5 + (time + i) / 7);
            positions.setZ(i, y);

        }

        positions.needsUpdate = true;


    }

}