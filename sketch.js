const X_NUM = 10,
    Y_NUM = 10,
    TILE_SIZE = 64

let images = {},
    entities = [],
    player,
    drawCoords = false

function Entity(imageName, x = 0, y = 0, tileWidth = 1, tileHeight = 1) {
    // The Cartesian tilemap coordinates
    this.cartCoords = createVector(x, y)

    // The sprite name
    this.imageName = imageName

    // The height and width in tilecount
    this.tileHeight = tileHeight
    this.tileWidth = tileWidth

    // The target Isometric pixel X, Y
    this.targetIso = createVector()

    // The current Isometric pixel X, Y
    this.currentPosIso = createVector()
}

function setup() {
    createCanvas(windowWidth, windowHeight)

    images["block"] = loadImage("block.png")
    images["player"] = loadImage("player.png")

    entities.push(new Entity("block", 0, 0))
    entities.push(new Entity("block", 4, 5))
    entities.push(new Entity("block", 4, 2))

    player = new Entity("player", 5, 0, 1, 3)
    entities.push(player)
}

function draw() {
    background(50)

    // TODO: Figure out how to do this generically
    let transIso = cartToIso(createVector(7 * TILE_SIZE, -4 * TILE_SIZE))
    translate(transIso.x, transIso.y)
    stroke(255)

    // Drawing grid
    for (let y = 0; y < Y_NUM; y++) {
        let cV1 = createVector(0, y * TILE_SIZE)
        let cV2 = createVector((Y_NUM - 1) * TILE_SIZE, y * TILE_SIZE)
        let iV1 = cartToIso(cV1)
        let iV2 = cartToIso(cV2)
        line(iV1.x, iV1.y, iV2.x, iV2.y)
    }
    for (let x = 0; x < X_NUM; x++) {
        let cV1 = createVector(x * TILE_SIZE, 0)
        let cV2 = createVector(x * TILE_SIZE, (X_NUM - 1) * TILE_SIZE)
        let iV1 = cartToIso(cV1)
        let iV2 = cartToIso(cV2)
        line(iV1.x, iV1.y, iV2.x, iV2.y)
    }

    // A crude Z-position sorting
    entities.sort((a, b) => {
        if ((a.cartCoords.x > b.cartCoords.x) ||
            (a.cartCoords.y > b.cartCoords.y)) {
            return 1
        } else if ((a.cartCoords.x > b.cartCoords.x) ||
            (a.cartCoords.y > b.cartCoords.y)) {
            return -1
        } else {
            return 0
        }
    })

    for (let i = 0; i < entities.length; i++) {
        let e = entities[i]
        let img = images[e.imageName]

        // Getting the Cartesian pixel location
        let cartPos = createVector(e.cartCoords.x * TILE_SIZE, e.cartCoords.y * TILE_SIZE)

        // Convert to Isometric pixel location
        let isoPos = cartToIso(cartPos)

        // Smooth the movement
        e.targetIso = isoPos
        e.currentPosIso = p5.Vector.lerp(e.currentPosIso, e.targetIso, 0.2)

        image(img,
            e.currentPosIso.x - ((TILE_SIZE * e.tileWidth)),
            e.currentPosIso.y - ((TILE_SIZE * e.tileHeight)),
            img.width, img.height)

        // Press "C" to draw the Cartesian tilemap coordinates for each entity
        if (drawCoords) {
            text(`${e.cartCoords.x}, ${e.cartCoords.y}`, isoPos.x + 10, isoPos.y + 10)
            ellipse(isoPos.x, isoPos.y, 5, 5)
        }
    }
}

function keyPressed() {
    const move = createVector()
    switch (key) {
        case "W": move.y--; break
        case "A": move.x--; break
        case "S": move.y++; break
        case "D": move.x++; break
        case "C": drawCoords = !drawCoords; break
        default: break
    }
    if (player && tileEmpty(player, player.cartCoords.copy().add(move))) {
        player.cartCoords.add(move)
    }
}

function cartToIso(pos) {
    const newPos = createVector()
    newPos.x = pos.x - pos.y
    newPos.y = (pos.x + pos.y) / 2
    return newPos
}

function tileEmpty(entity, cartCoords) {
    for (let i = 0; i < entities.length; i++) {
        let e = entities[i]
        if (e === entity) {
            continue
        }
        if (cartCoords.equals(e.cartCoords)) {
            return false
        }
    }
    return true
}