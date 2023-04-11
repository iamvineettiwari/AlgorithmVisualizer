import React from 'react';
import Tree from 'react-d3-tree';
import { linkVertical } from 'd3-shape';
import * as _ from 'lodash';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slider, Snackbar, TextField } from '@mui/material';
import { Box } from '@mui/system';

const STATES = {
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    DEFAULT: 'DEFAULT'
}

const renderRectSvgNode = ({ nodeDatum, onNodeClick }) => {
    if (!nodeDatum.name) {
        return;
    }
    return (
        <g>
            <circle cx="0" cy="0" r="25" stroke={nodeDatum.attributes.state === STATES.COMPLETED ? "green" : "black"} x="-15" strokeWidth={nodeDatum.attributes.state === STATES.PROCESSING || nodeDatum.attributes.state === STATES.COMPLETED ? 3 : 1} fill={nodeDatum.attributes.state === STATES.COMPLETED ? '#00da00' : nodeDatum.attributes.state === STATES.PROCESSING ? '#cccccc' : '#ffffff'} onClick={onNodeClick} />
            <text fill="black" strokeWidth="0.5" x={-(String(nodeDatum.name).length * 0.9 * 6)} y="6" onClick={onNodeClick}>
                {nodeDatum.name}
            </text>
        </g>
    )
};

const TreeTraversals = () => {
    const [speed, setSpeed] = React.useState(500);
    const [element, setElement] = React.useState("");
    const [error, setError] = React.useState("");
    const [processing, setProcessing] = React.useState(false);
    const [treeData, setTreeData] = React.useState({});
    const [activeNode, setActiveNode] = React.useState(null);
    const [openForm, setOpenForm] = React.useState(false);
    const [childs, setChilds] = React.useState({
        left: "",
        right: ""
    });

    const [dimensions] = React.useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const timers = React.useRef([]);

    const handleInput = (e) => {
        const value = e.target.value;
        const re = /^[0-9\b]+$/;
        if (value === '' || re.test(value)) {
            setElement(value);
        }
    }

    const sanatize = (value) => {
        const re = /^[0-9\b]+$/;
        if (value === '' || re.test(value)) {
            return true;
        }

        return false;
    }

    const handleEnterKey = (e) => {
        if (e.key === "Enter") {
            handleAddRoot();
        }
    }

    const handleAddRoot = () => {
        if (element.length === 0) {
            return;
        }

        const item = parseInt(element);
        setElement("");

        setTreeData({
            name: item,
            attributes: {
                state: STATES.DEFAULT
            },
            children: []
        })
    }

    const inOrder = async (tempData, root, data) => {
        if (root === undefined || root === null || root.name === undefined) {
            return;
        }

        if (root.attributes) {
            root.attributes.state = STATES.PROCESSING;
        }

        let arr = _.cloneDeep(tempData);
        data.push(arr);

        inOrder(tempData, root.children && root.children[0], data);

        if (root.attributes) {
            root.attributes.state = STATES.COMPLETED;
        }

        arr = _.cloneDeep(tempData);

        data.push(arr);

        inOrder(tempData, root.children && root.children[1], data);
    }

    const preOrder = async (tempData, root, data) => {
        if (root === undefined || root === null || root.name === undefined) {
            return;
        }

        if (root.attributes) {
            root.attributes.state = STATES.PROCESSING;
        }

        let arr = _.cloneDeep(tempData);
        data.push(arr);

        if (root.attributes) {
            root.attributes.state = STATES.COMPLETED;
        }

        arr = _.cloneDeep(tempData);

        data.push(arr);

        preOrder(tempData, root.children && root.children[0], data);


        preOrder(tempData, root.children && root.children[1], data);

    }

    const postOrder = async (tempData, root, data) => {
        if (root === undefined || root === null || root.name === undefined) {
            return;
        }

        if (root.attributes) {
            root.attributes.state = STATES.PROCESSING;
        }

        let arr = _.cloneDeep(tempData);
        data.push(arr);

        postOrder(tempData, root.children && root.children[0], data);
        postOrder(tempData, root.children && root.children[1], data);

        if (root.attributes) {
            root.attributes.state = STATES.COMPLETED;
        }

        arr = _.cloneDeep(tempData);

        data.push(arr);

    }

    const resetTree = (root) => {
        if (root === null || root === undefined || root.name === undefined) {
            return;
        }
        if (root.attributes)
            root.attributes.state = STATES.DEFAULT;

        resetTree(root.children && root.children[0]);
        resetTree(root.children && root.children[1]);

    }

    const resetTraversal = () => {
        for (let timer of timers.current) {
            clearTimeout(timer);
        }
        timers.current = [];
        resetTree(treeData);
    }

    const performOperation = (option) => {
        resetTraversal();

        if (!Object.keys(treeData).length) {
            return;
        }

        setProcessing(true);

        const tempData = _.cloneDeep(treeData);
        const data = [];

        if (option === "PREORDER") {
            preOrder(tempData, tempData, data);
        } else if (option === "INORDER") {
            inOrder(tempData, tempData, data);
        } else {
            postOrder(tempData, tempData, data);
        }

        for (let i = 0; i < data.length; i++) {
            const timer = setTimeout(() => {
                setTreeData(data[i]);
                if (i === data.length - 1) {
                    setProcessing(false);
                }
            }, i * speed);
            timers.current.push(timer);
        }
    }

    const handleNodeClick = (node) => {
        if (processing) {
            return;
        }

        resetTraversal();
        setActiveNode(node);
        setOpenForm(true);
    }

    const findNode = (root, node) => {
        if (root === null || root === undefined || root.name === undefined) {
            return undefined;
        }

        if (parseInt(root.name) === parseInt(node.data.name)) {
            return root;
        }

        let left = findNode(root.children && root.children[0], node);
        let right = findNode(root.children && root.children[1], node);

        return left || right
    }

    const handleDialogSubmit = () => {
        const { left, right } = childs;
        const rootNode = activeNode;

        let [leftData, rightData] = [{}, {}];

        if (left.length > 0) {
            leftData = {
                name: parseInt(left),
                attributes: {
                    state: STATES.DEFAULT
                }
            }
        }

        if (right.length > 0) {
            rightData = {
                name: parseInt(right),
                attributes: {
                    state: STATES.DEFAULT
                }
            }
        }

        const temp = _.cloneDeep(treeData);

        const node = findNode(temp, rootNode);

        if (node) {
            if (node.children) {
                node.children[0] = leftData;
                node.children[1] = rightData;
            } else {
                node.children = [leftData, rightData];
            }
            setTreeData(temp);
        }

        handleDialogClose();
    }

    const handleDialogClose = () => {
        setChilds({
            left: "",
            right: ""
        });
        setOpenForm(false);
        setActiveNode(null);
    }

    return (
        <div style={{
            padding: '20px'
        }}>
            <Snackbar
                open={error.length > 0}
                autoHideDuration={6000}
                onClose={() => setError("")}
            >
                <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Dialog open={openForm} onClose={handleDialogClose}>
                {activeNode && <DialogTitle>Enter Data for node : <span style={{ fontWeight: 'bold' }}>{activeNode.data.name}</span></DialogTitle>}
                <DialogContent>
                    <DialogContentText sx={{ marginBottom: '15px' }}>
                        Enter left and right nodes for the selected node. <br></br>Leave blank field in case of <span style={{ fontWeight: 'bold' }}>null node</span>.
                    </DialogContentText>
                    <TextField
                        value={childs.left} inputMode="numeric" onChange={(e) => {
                            if (sanatize(e.target.value)) {
                                setChilds((val) => ({ ...val, left: e.target.value }))
                            }
                        }} size='small' label='Enter left node'
                    />
                    <TextField
                        sx={{ marginLeft: '15px' }}
                        value={childs.right} inputMode="numeric" onChange={(e) => {
                            if (sanatize(e.target.value)) {
                                setChilds((val) => ({ ...val, right: e.target.value }))
                            }
                        }} size='small' label='Enter Right node'
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={handleDialogSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <TextField value={element} inputMode="numeric" onChange={handleInput} size='small' label='Enter root node' onKeyDown={handleEnterKey} disabled={processing || Object.keys(treeData).length > 0} />
                    <Button variant='contained' sx={{ marginLeft: '10px' }} disabled={processing || Object.keys(treeData).length > 0} onClick={handleAddRoot}>Add</Button>
                    <Button variant='outlined' sx={{ marginLeft: '10px' }} disabled={processing || Object.keys(treeData).length > 0} onClick={(e) => { resetTraversal(); setTreeData({}); }}>Clear All</Button>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <p style={{
                        margin: 0
                    }}>Animation Speed</p>
                    <Box sx={{ width: 200 }}>
                        <Slider
                            defaultValue={speed}
                            value={speed}
                            step={100}
                            marks
                            min={0}
                            max={1500}
                            valueLabelDisplay="auto"
                            onChange={(e) => {
                                setSpeed(e.target.value);
                            }}
                            valueLabelFormat={(e) => (e / 1000) + " seconds"}
                            disabled={processing}
                        />
                    </Box>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Button variant="contained" sx={{ marginLeft: '10px' }} onClick={() => performOperation("INORDER")} disabled={processing}>In-Order</Button>
                    <Button variant="contained" sx={{ marginLeft: '10px' }} onClick={() => performOperation("PREORDER")} disabled={processing}>Pre-Order</Button>
                    <Button variant="contained" sx={{ marginLeft: '10px' }} onClick={() => performOperation("POSTORDER")} disabled={processing}>Post-Order</Button>
                </div>

            </div>
            {Object.keys(treeData).length === 0 && <div style={{ width: dimensions.width - 40, height: dimensions.height - 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Enter tree data to visualize the algorithms.</div>}
            {Object.keys(treeData).length > 0 && <div style={{ width: dimensions.width - 40, height: dimensions.height - 200 }}>
                <Tree
                    data={treeData}
                    orientation="vertical"
                    renderCustomNodeElement={renderRectSvgNode}
                    pathFunc={({ source, target }) => {
                        if (target.data.name === undefined) return null;
                        if (target.type === 'plus') return null;
                        return linkVertical()({
                            source: [source.x, source.y],
                            target: [target.x, target.y],
                        })
                    }}
                    translate={{
                        x: dimensions.width / 2,
                        y: dimensions.height / 3,
                    }}
                    collapsible={false}
                    onNodeClick={handleNodeClick}
                />
            </div>}

            <div>
                Time Complexity : O(n)
            </div>
        </div >

    )
}

export default TreeTraversals;