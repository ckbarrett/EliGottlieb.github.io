const s = (p) => {
    let canvasWidth = 700
    let canvaseLength = 400

    function drawBrain() {
        let input_nodesPos = []
        let hidden_nodes_1Pos = []
        let hidden_nodes_2Pos = []
        let output_nodesPos = []
        let rowGap = 5
        let colGap = 170
        let diameter = 20
        let inputX = 120
        let inputY = 60
        let labelY = 30

        // Label the input node column
        p.stroke(10)
        p.fill(0)
        let inputLabel = "Input Nodes"
        p.text(inputLabel, inputX - (p.textWidth(inputLabel) / 2), labelY)

        // Prepare labels for the input node rows
        let inputlabels = ["Danger Up", "Danger Down", "Danger Left", "Danger Right", "Facing Up", "Facing Down", "Facing Left", "Facing Right", "Food Up", "Food Down", "Food Left", "Food Right", "Distance to Food"]

        // Draw the input nodes and create the labels
        var x = inputX
        var y = inputY
        let mid;
        for (let i = 0; i < qlearner.brain.input_nodes; i++) {
            if (qlearner.brain.input_nodes / 2 == i) {
                mid = y + diameter / 2 + rowGap / 2
            }
            else if (Math.floor(qlearner.brain.input_nodes / 2) == i) {
                mid = y
            }
            p.fill(0)
            p.text(inputlabels[i], x - (textWidth(inputlabels[i] + diameter)), y + 4);
            p.fill(200)
            p.ellipse(x, y, diameter)
            input_nodesPos.push({ x: x, y: y })
            y += (diameter + rowGap)
        }
        
        // Get display info for hidden layers [diameter, circleGap]
        let yDif = ((qlearner.brain.input_nodes - 1) * diameter + (qlearner.brain.input_nodes - 1) * rowGap)
        let hiddenDisplayInfo = getHiddenDisplayInfo(yDif, qlearner.brain.hidden_nodes_1, (1.0 * rowGap / diameter), diameter)
        let hiddenDiameter = hiddenDisplayInfo[0]
        let hiddenRowGap = hiddenDisplayInfo[1]
        let hiddenY = mid
        let shift
        if (qlearner.brain.hidden_nodes_1 % 2 == 0) {
            shift = ((qlearner.brain.hidden_nodes_1 / 2) - 1) * hiddenRowGap + 0.5 * hiddenRowGap + ((qlearner.brain.hidden_nodes_1 / 2) - 1) * hiddenDiameter + 0.5 * hiddenDiameter
        }
        else {
            shift = (Math.floor(qlearner.brain.hidden_nodes_1 / 2) * hiddenDiameter) + (Math.floor(qlearner.brain.hidden_nodes_1 / 2) * hiddenRowGap)
        }
        hiddenY -= shift
        hiddenY = Math.max(inputY, hiddenY)

        // Shift the x over, and label the hidden layer 1 node column
        x += colGap
        y = hiddenY
        let bias_h1 = qlearner.brain.bias_h1.toArray()
        let h1label = "Hidden Layer 1"
        p.fill(0)
        p.stroke(10)
        p.text(h1label, x - (p.textWidth(h1label) / 2), labelY)

        // Draw the hidden layer 1 nodes and fill in with biases
        for (let i = 0; i < qlearner.brain.hidden_nodes_1; i++) {
            let colorArr = mapToOpacity(bias_h1[i])
            p.fill(colorArr[0], colorArr[1], colorArr[2], colorArr[3])
            p.ellipse(x, y, hiddenDiameter)
            hidden_nodes_1Pos.push({ x: x, y: y })
            y += (hiddenDiameter + hiddenRowGap)
        }

        // Draw lines between each input node and all h1 nodes and color with weights
        drawlines(input_nodesPos, hidden_nodes_1Pos, qlearner.brain.weights_input_h1.data, diameter, hiddenDiameter)

        // Shift the x over, and label the hidden layer 2 node column
        x += colGap
        y = hiddenY
        let bias_h2 = qlearner.brain.bias_h2.toArray()
        let h2label = "Hidden Layer 2"
        p.fill(0)
        p.stroke(10)
        p.text(h2label, x - textWidth(h2label) / 2, labelY)
        // Draw the hidden layer 1 nodes and fill in with biases
        for (let i = 0; i < qlearner.brain.hidden_nodes_2; i++) {
            let colorArr = mapToOpacity(bias_h2[i])
            p.fill(colorArr[0], colorArr[1], colorArr[2], colorArr[3])
            p.ellipse(x, y, hiddenDiameter)
            hidden_nodes_2Pos.push({ x: x, y: y })
            y += (hiddenDiameter + hiddenRowGap)
        }

        // Draw lines between each h1 node and all h2 nodes and color with weights
        drawlines(hidden_nodes_1Pos, hidden_nodes_2Pos, qlearner.brain.weights_h1_h2.data, hiddenDiameter, hiddenDiameter)

        // Shift the x over, and label the output node column
        x += colGap
        y = mid
        if (qlearner.brain.output_nodes % 2 == 0) {
            let shift = ((qlearner.brain.output_nodes / 2) - 1) * rowGap + 0.5 * rowGap + ((qlearner.brain.output_nodes / 2) - 1) * diameter + 0.5 * diameter
            y -= shift
        }

        let bias_output = qlearner.brain.bias_output.toArray()
        let outputlabel = "Output Nodes"
        p.fill(0)
        p.stroke(10)
        p.text(outputlabel, x - textWidth(outputlabel) / 2, labelY)

        // Prepare labels for the output row nodes
        let outputlabels = ["Up", "Down", "Left", "Right"]

        // Draw the output layer nodes and fill in with biases
        for (let i = 0; i < qlearner.brain.output_nodes; i++) {
            p.fill(0)
            p.stroke(10)
            p.text(outputlabels[i], x + diameter, y + 3);
            let colorArr = mapToOpacity(bias_output[i])
            p.fill(colorArr[0], colorArr[1], colorArr[2], colorArr[3])
            p.ellipse(x, y, diameter)
            output_nodesPos.push({ x: x, y: y })
            y += (diameter + rowGap)
        }

        // Draw lines between each h2 node and all output nodes and color with weights
        drawlines(hidden_nodes_2Pos, output_nodesPos, qlearner.brain.weights_h2_output.data, hiddenDiameter, diameter)
    }

    function drawlines(startNodesArray, endNodesArrary, weights, startdiameter, enddiameter) {
        let startradius = startdiameter / 2
        let endradius = enddiameter / 2
        for (let i = 0; i < endNodesArrary.length; i++) {
            //if (i > 0) break;
            let endNode = endNodesArrary[i]
            let weightsArray = weights[i]
            for (let j = 0; j < startNodesArray.length; j++) {
                let startNode = startNodesArray[j]
                let startX = startNode.x + startradius
                let startY = startNode.y
                let endX = endNode.x - endradius
                let endY = endNode.y
                let colorArr = mapToOpacity(weightsArray[j])
                p.stroke(colorArr[0], colorArr[1], colorArr[2], colorArr[3])
                p.line(startX, startY, endX, endY)
                //j += 2
            }
        }
    }

    function getHiddenDisplayInfo(displayInterval, nodesNum, ratio, originalDiameter) {
        // Get display info for hidden layers [diameter, circleGap]
        let diameter = (displayInterval) / (nodesNum * (1 + ratio) - (1 + ratio))
        diameter = Math.min(diameter, originalDiameter)
        let rowGap = (diameter * ratio)
        return [diameter, rowGap]
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
