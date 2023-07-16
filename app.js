"use strict";
class BoardScene extends Phaser.Scene {
    constructor() {
        super('board');
        this.buttons = new Map();
    }
    preload() {
        Resource.load(this, [
            Resource.Image.ButtonUp,
            Resource.Image.ButtonDown
        ]);
    }
    create() {
        const size = Layout.button.size;
        for (let c = 0; c < Layout.board.cols; c++) {
            for (let r = 0; r < Layout.board.rows; r++) {
                let b = new Button(this, c, r);
                this.add.container(c * size.width + size.width / 2, r * size.height + size.height / 2, b);
                if (c == 1 && r == 1)
                    b.toggle();
                this.buttons.set(JSON.stringify({ col: c, row: r }), b);
                if (Math.random() < 0.5)
                    this.drop();
            }
        }
        this.input.on('pointerdown', (event, targets, x, y) => {
            if (targets.length == 0)
                return;
            this.click(targets[0]);
        });
    }
    click(target) {
        const pos = target.pos;
        for (let dx = -1; dx <= 1; ++dx)
            for (let dy = -1; dy <= 1; ++dy) {
                if (!(Math.abs(dx) + Math.abs(dy) == 1))
                    continue;
                const c = { col: pos.col + dx, row: pos.row + dy };
                let source = this.buttons.get(JSON.stringify(c));
                if (!source)
                    continue;
                if (source.isDown()) {
                    source.toggle();
                    target.toggle();
                    if (source.value == target.value) {
                        target.setValue(target.value * 2);
                        source.setValue(0);
                    }
                    else if (target.value == 0) {
                        target.setValue(source.value);
                        source.setValue(0);
                    }
                }
            }
        if (Math.random() < 0.3)
            this.drop();
    }
    drop() {
        let blanks = 0;
        this.buttons.forEach((b) => {
            if (b.value == 0)
                blanks++;
        });
        if (blanks == 0)
            return;
        this.buttons.forEach((b) => {
            if (b.value == 0 && Math.random() < 1.0 / blanks)
                b.setValue(1);
        });
    }
}
class Button extends Phaser.GameObjects.Container {
    constructor(scene, col, row) {
        super(scene);
        this.value = 0;
        const size = Layout.button.size;
        this.setSize(size.width, size.height);
        // this.setPosition(col * size.width + size.width/2, row * size.height+size.height/2);
        this.addImageLayer(Resource.Image.ButtonDown, 1);
        this.down = this.addImageLayer(Resource.Image.ButtonUp, 1);
        this.text = new Phaser.GameObjects.Text(this.scene, 0, 0, '?', { fontFamily: 'verdana', fontSize: '6em' });
        this.add(this.text);
        this.setValue(0);
        this.setInteractive({});
        this.status = false;
        this.pos = { col: col, row: row };
    }
    toggle() {
        this.status = !this.status;
        this.down.visible = !this.status;
    }
    isDown() {
        return this.status;
    }
    setValue(value) {
        this.value = value;
        if (value == 0) {
            this.text.visible = false;
        }
        else {
            this.text.visible = true;
            this.text.text = value.toString();
        }
    }
    addImageLayer(image, z) {
        let imageObject = new Phaser.GameObjects.Image(this.scene, 0, 0, image);
        imageObject.setDisplaySize(this.width, this.height);
        imageObject.setZ(z);
        this.add(imageObject);
        return imageObject;
    }
}
// Layout manager of the game
var Layout;
(function (Layout) {
    Layout.board = { cols: 4, rows: 5 };
    Layout.screen = { width: 1000, height: 1250 };
    Layout.button = { size: { width: 1000 / 4, height: 1250 / 5 } };
})(Layout || (Layout = {}));
/**
 * The logger
 */
var Log;
(function (Log) {
    const enabled = true;
    const _silent = (...data) => { }; // do nothing
    Log.debug = enabled ? console.debug : _silent;
    Log.info = enabled ? console.log : _silent;
    Log.warn = enabled ? console.warn : _silent;
    Log.error = enabled ? console.error : _silent;
})(Log || (Log = {}));
class LoadingScene extends Phaser.Scene {
    constructor() {
        super('loading');
    }
    create() {
        this.add.text(0, 0, 'Loading ...', { fontFamily: 'verdana', fontSize: '2.5em' });
        this.scene.start('board');
    }
}
class TheGame extends Phaser.Game {
    constructor() {
        let renderer = /iPad/.test(navigator.platform) ? Phaser.CANVAS : Phaser.AUTO;
        Log.info('renderer type: %s', renderer);
        super({
            type: renderer,
            scale: {
                mode: Phaser.Scale.FIT,
                width: Layout.screen.width, height: Layout.screen.height,
                parent: 'screen',
            },
            scene: [
                LoadingScene,
                BoardScene,
                //         DevConsoleScene,
            ]
        });
        // Layout.setSize(Layout.Size.Medium);
        // this.scene.start('loading');
    }
}
window.onload = () => {
    Log.info('<- start ->');
    new TheGame();
};
var Resource;
(function (Resource) {
    let Image;
    (function (Image) {
        Image.ButtonUp = 'image.switch.up';
        Image.ButtonDown = 'image.switch.down';
    })(Image = Resource.Image || (Resource.Image = {}));
    // load a resource
    function load(scene, ids) {
        ids.forEach((id) => {
            if (id.startsWith('image.')) {
                Log.info('load image:', id);
                scene.load.image(id, assets.get(id));
            }
            if (id.startsWith('sound.')) {
                Log.info('load audio:', id);
                scene.load.audio(id, assets.get(id));
            }
        });
    }
    Resource.load = load;
    // the actual data files
    const assets = new Map([
        // images
        [Image.ButtonUp, './assets/graphics/up.png'],
        [Image.ButtonDown, './assets/graphics/down.png'],
    ]);
})(Resource || (Resource = {}));
//# sourceMappingURL=app.js.map