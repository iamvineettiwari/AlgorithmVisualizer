import React from 'react';
import { Graph } from "react-d3-graph";
import { Button, Slider } from '@mui/material';
import { Box } from '@mui/system';

const GraphTraversals = (__) => {
    const [speed, setSpeed] = React.useState(500);
    const [processing, setProcessing] = React.useState(false);
    const [traverseAns, setTraverseAns] = React.useState([]);

    const selectedSource = React.useRef(null);
    const timers = React.useRef([]);

    const [dimensions] = React.useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [data, setData] = React.useState({
        nodes: [],
        links: []
    })

    const [nodeCount, setNodeCount] = React.useState(1);

    const createLink = (event, nodeId) => {
        event.preventDefault();

        if (processing) return;

        if (selectedSource.current === null) {
            selectedSource.current = nodeId;
            setData({
                ...data,
                nodes: data.nodes.map((node) => {
                    if (node.id === nodeId) {
                        node.color = "cyan";
                    }
                    return node
                })
            });

            return;
        }

        if (selectedSource.current === nodeId) {
            selectedSource.current = null;

            setData({
                ...data,
                nodes: data.nodes.map((node) => {
                    node.color = "gray";
                    return node
                })
            });

            return;
        }

        const source = selectedSource.current;
        selectedSource.current = null;

        setData({
            nodes: data.nodes.map((node) => {
                node.color = "gray";
                return node
            }),
            links: [...data.links, {
                source,
                target: nodeId
            }]
        });

    }

    const deleteNode = (nodeId) => {
        if (processing) return;

        setNodeCount((prev) => prev - 1);

        setData({
            nodes: data.nodes.filter((node) => node.id !== nodeId),
            links: data.links.filter((link) => link.source !== nodeId).filter((link) => link.target !== nodeId)
        })
    }

    const addNewNode = (e) => {
        if (processing) return;

        setNodeCount((count) => count + 1);
        setData((value) => ({
            ...value,
            nodes: [...value.nodes, { id: String(nodeCount), color: "gray", renderLabel: true }]
        }))
    }

    const resetGraph = () => {
        timers.current.forEach((timer) => {
            clearTimeout(timer);
        });

        setData({
            nodes: data.nodes.map((node) => {
                node.color = "gray";
                return node;
            }),
            links: data.links.map((link) => {
                link.color = "gray";
                link.strokeWidth = 2;
                return link;
            })
        })

        setTraverseAns([]);
        setProcessing(false);

    }

    const clearGraph = () => {
        if (processing) return;

        setTraverseAns([]);
        selectedSource.current = null;
        setProcessing(false);

        timers.current.forEach((timer) => {
            clearTimeout(timer);
        });

        setNodeCount(1);
        setData({
            links: [],
            nodes: []
        })
    }

    const getGraphData = () => {
        const graphData = [[]]

        for (let i = 1; i <= data.nodes.length; i++) {
            const targets = data.links.filter((link) => String(link.source) === String(i)).map((link) => link.target);
            const sources = data.links.filter((link) => String(link.target) === String(i)).map((link) => link.source);

            graphData.push([...targets, ...sources])
        }

        return graphData;
    }

    const traverseBFS = async () => {
        resetGraph();

        setProcessing(true);
        const graphData = getGraphData();

        const visited = [];

        for (let i = 0; i <= graphData.length; i++) {
            visited[i] = false;
        }

        let ans = [];

        for (let i = 1; i < graphData.length; i++) {
            if (!visited[i]) {
                const queue = []
                visited[i] = true;
                queue.push({
                    source: undefined,
                    target: i
                });
                doBFS(graphData, queue, visited, ans)
            }
        }

        for (let i = 0; i < ans.length; i++) {
            const promise = new Promise((resolve, _) => {
                const past = []

                ans.slice(0, i).forEach((data) => {
                    data.forEach((item) => {
                        past.push(String(item.target))
                    })
                })

                const timer = setTimeout(() => {
                    const targets = ans[i].map((d) => String(d.target));

                    ans[i].forEach((trav) => {
                        setTraverseAns(prev => [...new Set([...prev, String(trav.target)])])
                        setData({
                            nodes: data.nodes.map((node) => {
                                if (targets.includes(String(node.id))) {
                                    node.color = "green";
                                } else if (past.includes(String(node.id))) {
                                    node.color = "green";
                                } else {
                                    node.color = "gray";
                                }

                                return node;
                            }),
                            links: data.links.map((link) => {
                                const condition = (link.source === String(trav.source) && link.target === String(trav.target)) || (link.target === String(trav.source) && link.source === String(trav.target))
                                if (condition) {
                                    link.color = "green"
                                    link.strokeWidth = 6
                                }

                                return link
                            })
                        })

                    })

                    if (i === ans.length - 1) {
                        setProcessing(false);
                    }

                    resolve();
                }, i === 0 ? 0 : speed);
                timers.current.push(timer);
            })

            await promise;
        }
    }

    const traverseDFS = async () => {
        resetGraph();

        setProcessing(true);
        const graphData = getGraphData();

        const visited = [];

        for (let i = 0; i <= graphData.length; i++) {
            visited[i] = false;
        }

        const ans = [];

        for (let i = 1; i < graphData.length; i++) {
            if (!visited[i]) {
                doDFS(graphData, i, undefined, visited, ans);
            }
        }

        for (let i = 0; i < ans.length; i++) {
            const promise = new Promise((resolve, _) => {
                const past = ans.slice(0, i).map((d) => d.target);
                setTraverseAns([...past]);

                const timer = setTimeout(() => {
                    setData({
                        nodes: data.nodes.map((node) => {
                            if (String(node.id) === String(ans[i].target)) {
                                node.color = i === ans.length - 1 ? "green" : "blue";
                            } else if (past.includes(String(node.id))) {
                                node.color = "green";
                            } else {
                                node.color = "gray";
                            }

                            return node;
                        }),
                        links: data.links.map((link) => {
                            const condition = (link.source === ans[i].source && link.target === ans[i].target) || (link.target === ans[i].source && link.source === ans[i].target)
                            if (condition) {
                                link.color = "green"
                                link.strokeWidth = 6
                            }

                            return link
                        })
                    })

                    if (i === ans.length - 1) {
                        setTraverseAns((prev) => [...prev, ans[i].target])
                        setProcessing(false);
                    }

                    resolve();
                }, i === 0 ? 0 : speed);
                timers.current.push(timer);
            })

            await promise;
        }
    }

    const doDFS = (graphData, source, parent, visited, ans) => {
        if (visited[source]) {
            return;
        }

        ans.push({
            source: parent ? String(parent) : parent,
            target: String(source)
        });

        visited[source] = true;

        for (let i = 0; i < graphData[source].length; i++) {
            const dest = graphData[source][i];
            if (!visited[dest]) {
                doDFS(graphData, dest, source, visited, ans);
            }
        }
    }

    const doBFS = (graphData, queue, visited, ans) => {
        while (queue.length > 0) {
            const tempAns = []

            let size = queue.length;

            for (let i = 0; i < size; i++) {
                const there = ans.find((data) => {
                    return data.find((inD) => {
                        return parseInt(inD.source) === parseInt(queue[i].source) && parseInt(inD.target) === parseInt(queue[i].target)
                    })
                })
                if (!there) {
                    tempAns.push({
                        source: queue[i].source,
                        target: queue[i].target
                    })
                }
            }

            if (tempAns.length > 0) {
                ans.push(tempAns);
            }

            const curr = queue.shift();
            for (let i = 0; i < graphData[curr.target].length; i++) {
                const dest = parseInt(graphData[curr.target][i]);
                if (!visited[dest]) {
                    visited[dest] = true;
                    queue.push({
                        source: curr.target,
                        target: dest
                    });
                }
            }
        }
    }

    const deleteLink = (event, source, target) => {
        event.preventDefault();

        if (processing) return;

        setData({
            nodes: [...data.nodes],
            links: data.links.filter((link) => !(link.source === source && link.target === target))
        })
    }

    return (
        <>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Button variant="contained" onClick={addNewNode} disabled={processing}>Add node</Button>
                    <Button variant="contained" color="error" sx={{ marginLeft: 2 }} onClick={clearGraph} disabled={processing}>Clear</Button>
                    <Button variant="contained" color="warning" sx={{ marginLeft: 2 }} onClick={resetGraph}>Reset</Button>
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
                    <Button variant="contained" sx={{ marginLeft: 2 }} onClick={traverseBFS} disabled={processing}>BFS</Button>
                    <Button variant="contained" sx={{ marginLeft: 2 }} onClick={traverseDFS} disabled={processing}>DFS</Button>
                </div>

            </div>
            <div style={{
                width: dimensions.width - 10,
                height: dimensions.height - 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Graph
                    id="graph-traversal" // id is mandatory
                    data={data}
                    config={{
                        nodeHighlightBehavior: false,
                        node: {
                            color: "lightgreen",
                            size: 400,
                            fontSize: 18,
                        },
                        link: {
                            strokeWidth: 2
                        },
                        width: dimensions.width - 10,
                        height: dimensions.height - 80,
                        staticGraphWithDragAndDrop: true,
                        d3: {
                            linkLength: 150
                        }
                    }}
                    onRightClickNode={createLink}
                    onDoubleClickNode={deleteNode}
                    onRightClickLink={deleteLink}
                />
            </div>
            <div style={{
                display: "flex",
                alignItems: "center"
            }}>
                <h2>Traversal Ans:</h2>
                {traverseAns.map((trav, idx, arr) => (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        marginLeft: 5
                    }}>
                        <span key={trav} style={{
                            width: 35,
                            height: 35,
                            background: "lightgreen",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: 2,
                            fontSize: 14
                        }}>{trav}</span>
                        <span>{idx === arr.length - 1 ? "" : " | "}</span>
                    </div>
                ))}
            </div>
        </>
    )
}

export default GraphTraversals