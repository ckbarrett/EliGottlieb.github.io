const s = (p) => {
    let canvasWidth = 700
    let canvaseLength = 400

    function drawBrain() {
        let input_nodesPos = []
        let hidden_nodes_1Pos = []
        let hidden_nodes_2Pos = []
        let output_nodesPos = []
        let circleSpace = 27
        let colGap = 220
        let radius = 16



        // Draw input nodes
        let inputX = 15
        let inputY = 0
        p.stroke(10)
        p.fill(200)
        for (let i = 0; i < qlearner.brain.input_nodes; i++) {
            let x = inputX
            let y = inputY + ((i + 1) * circleSpace)
            p.ellipse(x, y, radius)
            input_nodesPos.push({ x: x, y: y })
        }

        // Draw hidden 1 nodes
        let h1X = inputX + colGap
        let h1Y = inputY
        let bias_h1 = qlearner.brain.bias_h1.toArray()
        p.stroke(10)
        for (let i = 0; i < qlearner.brain.hidden_nodes_1; i++) {
            let x = h1X
            let y = h1Y + ((i + 1) * circleSpace)
            let colorArr = mapToOpacity(bias_h1[i])
            p.fill(colorArr[0], colorArr[1], colorArr[2], colorArr[3])
            p.ellipse(x, y, radius)
            hidden_nodes_1Pos.push({ x: x, y: y })

        }

        // Draw lines between each input node and all h1 nodes
        drawlines(input_nodesPos, hidden_nodes_1Pos, qlearner.brain.weights_input_h1.data)

        // Draw hidden 2 nodes
        let h2X = h1X + colGap
        let h2Y = inputY
        let bias_h2 = qlearner.brain.bias_h2.toArray()
        p.stroke(10)
        for (let i = 0; i < qlearner.brain.hidden_nodes_2; i++) {
            let x = h2X
            let y = h2Y + ((i + 1) * circleSpace)
            let colorArr = mapToOpacity(bias_h2[i])
            p.fill(colorArr[0], colorArr[1], colorArr[2], colorArr[3])
            p.ellipse(x, y, radius)
            hidden_nodes_2Pos.push({ x: x, y: y })
        }

        // Draw lines between each h1 node and all h2 nodes
        drawlines(hidden_nodes_1Pos, hidden_nodes_2Pos, qlearner.brain.weights_h1_h2.data)

        //Draw output nodes
        let outputX = h2X + colGap
        let outputY = ((input_nodesPos.length * circleSpace) - inputY) / 2 - circleSpace * 2
        let bias_output = qlearner.brain.bias_output.toArray()
        p.stroke(10)
        for (let i = 0; i < qlearner.brain.output_nodes; i++) {
            let x = outputX
            let y = outputY + ((i + 1) * circleSpace)
            let colorArr = mapToOpacity(bias_output[i])
            p.fill(colorArr[0], colorArr[1], colorArr[2], colorArr[3])
            p.ellipse(x, y, radius)
            output_nodesPos.push({ x: x, y: y })
        }

        // Draw lines between each h2 node and all output nodes
        //console.log(qlearner.brain.weights_h2_output.data)
        drawlines(hidden_nodes_2Pos, output_nodesPos, qlearner.brain.weights_h2_output.data)
    }

    function drawlines(startNodesArray, endNodesArrary, weights) {
        for (let i = 0; i < endNodesArrary.length; i++) {
            //if (i > 0) break;
            let endNode = endNodesArrary[i]
            let weightsArray = weights[i]
            for (let j = 0; j < startNodesArray.length; j++) {
                let startNode = startNodesArray[j]
                let startX = startNode.x + 10
                let startY = startNode.y
                let endX = endNode.x - 10
                let endY = endNode.y
                let colorArr = mapToOpacity(weightsArray[j])
                p.stroke(colorArr[0], colorArr[1], colorArr[2], colorArr[3])
                p.line(startX, startY, endX, endY)
                //j += 2
            }
        }
    }

    function mapToColor(x) {
        if (x == 0)
            return [0, 0, 0]
        let input = Math.abs(x)
        let inputMax = 2
        let inputMin = 0
        let outputMax = 255
        let outputMin = 0
        let newVal = outputMin + ((outputMax - outputMin) / (inputMax - inputMin)) * (input - inputMin)
        if (newVal > 255)
            newVal = 255
        if (x < 0)
            return [255 - x, 0, x]
        return [x, 0, 255 - x]
    }

    function mapToOpacity(x) {
        if (x == 0)
            return [0, 0, 0, 0]
        let input = Math.abs(x)
        let inputMax = 2
        let inputMin = 0
        let outputMax = 255
        let outputMin = 0
        let newVal = outputMin + ((outputMax - outputMin) / (inputMax - inputMin)) * (input - inputMin)
        if (newVal > 255)
            newVal = 255
        if (x < 0)
            return [0, 0, 255, newVal]
        return [255, 0, 0, newVal]
    }
    p.setup = function () {
        p.createCanvas(canvasWidth, canvaseLength)
    }

    p.draw = function () {
        p.background(255);
        drawBrain()
    }

}
var x = new p5(s, 'jimmybrain')
