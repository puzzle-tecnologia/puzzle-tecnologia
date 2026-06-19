class PuzzleBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'puzzleCanvas';
        this.canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
        document.body.prepend(this.canvas);

        this.puzzles = [];
        this.cubes = [];
        this.time = 0;
        this.resize();
        this.init();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.w = this.canvas.width = window.innerWidth;
        this.h = this.canvas.height = window.innerHeight;
    }

    init() {
        for (let i = 0; i < 6; i++) {
            this.puzzles.push(new PuzzlePiece(
                Math.random() * this.w,
                Math.random() * this.h,
                30 + Math.random() * 40,
                Math.random() * Math.PI * 2,
                Math.random() * 0.3 + 0.1
            ));
        }

        for (let i = 0; i < 4; i++) {
            this.cubes.push(new RubiksCube(
                Math.random() * this.w,
                Math.random() * this.h,
                20 + Math.random() * 25,
                Math.random() * 0.4 + 0.15
            ));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.time += 0.01;

        this.puzzles.forEach(p => {
            p.update(this.time);
            p.draw(this.ctx);
        });

        this.cubes.forEach(c => {
            c.update(this.time);
            c.draw(this.ctx);
        });

        requestAnimationFrame(() => this.animate());
    }
}

class PuzzlePiece {
    constructor(x, y, size, angle, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.angle = angle;
        this.speed = speed;
        this.targetX = x;
        this.targetY = y;
        this.phase = Math.random() * Math.PI * 2;
        this.opacity = 0.08 + Math.random() * 0.06;
        this.solving = false;
        this.solveTimer = 0;
        this.solved = false;
        this.drift = { x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.2 };
        this.color = Math.random() > 0.5 ? '#00b08b' : '#00d4a8';
    }

    update(t) {
        this.solveTimer += 0.003;

        if (!this.solving && this.solveTimer > 3 + Math.random() * 4) {
            this.solving = true;
            this.targetX = this.x + (Math.random() - 0.5) * 60;
            this.targetY = this.y + (Math.random() - 0.5) * 40;
            this.angle = Math.round(this.angle / (Math.PI / 2)) * (Math.PI / 2);
        }

        if (this.solving) {
            this.x += (this.targetX - this.x) * 0.02;
            this.y += (this.targetY - this.y) * 0.02;
            this.angle += (Math.round(this.angle / (Math.PI / 2)) * (Math.PI / 2) - this.angle) * 0.05;

            const dist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
            if (dist < 1) {
                this.solved = true;
                setTimeout(() => {
                    this.solving = false;
                    this.solved = false;
                    this.solveTimer = 0;
                    this.targetX = this.x + (Math.random() - 0.5) * 200;
                    this.targetY = this.y + (Math.random() - 0.5) * 200;
                }, 2000 + Math.random() * 3000);
            }
        } else {
            this.x += this.drift.x + Math.sin(t * 0.5 + this.phase) * 0.3;
            this.y += this.drift.y + Math.cos(t * 0.3 + this.phase) * 0.2;
            this.angle += this.speed * 0.01;
        }

        if (this.x < -100) this.x = this.w + 100;
        if (this.x > this.w + 100) this.x = -100;
        if (this.y < -100) this.y = this.h + 100;
        if (this.y > this.h + 100) this.y = -100;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.solved ? this.opacity + 0.05 : this.opacity;

        const s = this.size;
        const notch = s * 0.25;

        ctx.beginPath();
        ctx.moveTo(-s / 2, -s / 2);
        ctx.lineTo(-s / 2 + s * 0.35, -s / 2);
        ctx.bezierCurveTo(-s / 2 + s * 0.35, -s / 2 - notch, -s / 2 + s * 0.65, -s / 2 - notch, -s / 2 + s * 0.65, -s / 2);
        ctx.lineTo(s / 2, -s / 2);

        ctx.lineTo(s / 2, -s / 2 + s * 0.35);
        ctx.bezierCurveTo(s / 2 + notch, -s / 2 + s * 0.35, s / 2 + notch, -s / 2 + s * 0.65, s / 2, -s / 2 + s * 0.65);
        ctx.lineTo(s / 2, s / 2);

        ctx.lineTo(s / 2 - s * 0.35, s / 2);
        ctx.bezierCurveTo(s / 2 - s * 0.35, s / 2 + notch, s / 2 - s * 0.65, s / 2 + notch, s / 2 - s * 0.65, s / 2);
        ctx.lineTo(-s / 2, s / 2);

        ctx.lineTo(-s / 2, s / 2 - s * 0.35);
        ctx.bezierCurveTo(-s / 2 - notch, s / 2 - s * 0.35, -s / 2 - notch, s / 2 - s * 0.65, -s / 2, s / 2 - s * 0.65);
        ctx.closePath();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (this.solved) {
            ctx.fillStyle = this.color.replace(')', ', 0.15)').replace('rgb', 'rgba');
            ctx.fill();
        }

        ctx.restore();
    }
}

class RubiksCube {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.rotX = Math.random() * Math.PI * 2;
        this.rotY = Math.random() * Math.PI * 2;
        this.rotZ = Math.random() * Math.PI * 2;
        this.drift = { x: (Math.random() - 0.5) * 0.4, y: (Math.random() - 0.5) * 0.3 };
        this.opacity = 0.06 + Math.random() * 0.05;
        this.phase = Math.random() * Math.PI * 2;
        this.colors = ['#00b08b', '#00d4a8', '#009473', '#00b08b'];
    }

    update(t) {
        this.rotX += this.speed * 0.015;
        this.rotY += this.speed * 0.02;
        this.rotZ += this.speed * 0.008;
        this.x += this.drift.x + Math.sin(t * 0.4 + this.phase) * 0.2;
        this.y += this.drift.y + Math.cos(t * 0.25 + this.phase) * 0.15;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.opacity;

        const s = this.size;
        const hs = s / 2;

        const faces = [
            { normal: [1, 0, 0], color: this.colors[0] },
            { normal: [-1, 0, 0], color: this.colors[1] },
            { normal: [0, 1, 0], color: this.colors[2] },
            { normal: [0, -1, 0], color: this.colors[3] },
            { normal: [0, 0, 1], color: this.colors[0] },
            { normal: [0, 0, -1], color: this.colors[1] },
        ];

        const cosX = Math.cos(this.rotX), sinX = Math.sin(this.rotX);
        const cosY = Math.cos(this.rotY), sinY = Math.sin(this.rotY);
        const cosZ = Math.cos(this.rotZ), sinZ = Math.sin(this.rotZ);

        const project = (x, y, z) => {
            let rx = x, ry = y * cosX - z * sinX, rz = y * sinX + z * cosX;
            let px = rx * cosY + rz * sinY, py = ry, pz = -rx * sinY + rz * cosY;
            let fx = px * cosZ - py * sinZ, fy = px * sinZ + py * cosZ;
            return { x: fx, y: fy, z: pz };
        };

        const cubeVerts = [
            [-hs, -hs, -hs], [hs, -hs, -hs], [hs, hs, -hs], [-hs, hs, -hs],
            [-hs, -hs, hs], [hs, -hs, hs], [hs, hs, hs], [-hs, hs, hs]
        ];

        const faceIndices = [
            [0, 3, 2, 1], [4, 5, 6, 7],
            [0, 4, 7, 3], [1, 2, 6, 5],
            [0, 1, 5, 4], [2, 3, 7, 6]
        ];

        const projected = cubeVerts.map(v => project(v[0], v[1], v[2]));

        const sortedFaces = faceIndices.map((indices, i) => {
            const avgZ = indices.reduce((sum, idx) => sum + projected[idx].z, 0) / 4;
            return { indices, color: faces[i].color, avgZ };
        }).sort((a, b) => b.avgZ - a.avgZ);

        sortedFaces.forEach(face => {
            const pts = face.indices.map(i => projected[i]);

            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.closePath();

            ctx.fillStyle = face.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 10, 30, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();

            const gs = s / 3;
            for (let i = 1; i < 3; i++) {
                const t1 = i / 3;
                const lx1 = pts[0].x + (pts[1].x - pts[0].x) * t1;
                const ly1 = pts[0].y + (pts[1].y - pts[0].y) * t1;
                const lx2 = pts[3].x + (pts[2].x - pts[3].x) * t1;
                const ly2 = pts[3].y + (pts[2].y - pts[3].y) * t1;
                ctx.beginPath();
                ctx.moveTo(lx1, ly1);
                ctx.lineTo(lx2, ly2);
                ctx.strokeStyle = 'rgba(0, 10, 30, 0.4)';
                ctx.lineWidth = 0.8;
                ctx.stroke();

                const tx1 = pts[0].x + (pts[3].x - pts[0].x) * t1;
                const ty1 = pts[0].y + (pts[3].y - pts[0].y) * t1;
                const tx2 = pts[1].x + (pts[2].x - pts[1].x) * t1;
                const ty2 = pts[1].y + (pts[2].y - pts[1].y) * t1;
                ctx.beginPath();
                ctx.moveTo(tx1, ty1);
                ctx.lineTo(tx2, ty2);
                ctx.strokeStyle = 'rgba(0, 10, 30, 0.4)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        });

        ctx.restore();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PuzzleBackground();
});
