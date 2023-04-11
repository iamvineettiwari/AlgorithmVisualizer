import { Alert, Button, Slider, Snackbar, TextField } from '@mui/material';
import React from 'react';
import * as _ from 'lodash';
import { Box } from '@mui/system';

const STATES = {
    default: {
        backgroundColor: '#ededed',
        textColor: '#000000',
        borderColor: '#ededed',
        scale: 1
    },
    processing: {
        backgroundColor: '#f7ff00',
        textColor: '#000000',
        borderColor: '#f7ff00',
        scale: 1.5
    },
    target: {
        backgroundColor: '#126b00',
        textColor: '#ffffff',
        borderColor: '#126b00',
        scale: 2
    },
    mid: {
        backgroundColor: '#8b00ff',
        textColor: '#ffffff',
        borderColor: '#8b00ff',
        scale: 1.5
    }
}

const Searching = () => {
    const [speed, setSpeed] = React.useState(500);
    const [element, setElement] = React.useState("");
    const [arrayData, setArrayData] = React.useState([]);
    const [targetElement, setTargetElement] = React.useState("");
    const [error, setError] = React.useState("");
    const [searchMethod, setSearchMethod] = React.useState("");
    const [itemsProcessed, setItemsProcessed] = React.useState(0);

    const searchTimers = React.useRef([]);

    const handleInput = (e) => {
        const value = e.target.value;
        const re = /^[0-9\b]+$/;
        if (value === '' || re.test(value)) {
            setElement(value);
        }
    }

    const handleTargetInput = (e) => {
        const value = e.target.value;
        const re = /^[0-9\b]+$/;
        if (value === '' || re.test(value)) {
            setTargetElement(value);
        }
    }

    const handleEnterKey = (e) => {
        if (e.key === "Enter") {
            handleAddItem();
        }
    }

    const handleAddItem = () => {
        if (element.length === 0) {
            return;
        }

        if (arrayData.length > 25) {
            setError("Maximum 25 elements are allowed !")
            return;
        }
        const item = element;
        setElement("");

        setArrayData([...arrayData, {
            id: String(Date.now()),
            value: parseInt(item),
            label: item,
            state: STATES.default
        }]);
    }

    const resetSearch = () => {
        searchTimers.current.forEach((timers) => {
            clearTimeout(timers);
        });

        setArrayData(arrayData.map((d) => {
            d.state = STATES.default;
            return d;
        }));

        searchTimers.current = [];
        setSearchMethod("");
        setItemsProcessed(0);
    }

    const handleLinearSearch = () => {
        if (targetElement.length === 0) {
            return;
        }

        resetSearch();
        setSearchMethod("Linear Search");

        for (let i = 0; i < arrayData.length; i++) {
            const timer = setTimeout(() => {
                const newArr = _.cloneDeep(arrayData);
                newArr[i].state = STATES.processing;
                if (newArr[i].value === parseInt(targetElement)) {
                    newArr[i].state = STATES.target;
                }
                setArrayData(newArr);

                if (i === arrayData.length - 1 && arrayData[i].value !== parseInt(targetElement)) {
                    const timer = setTimeout(() => {
                        setArrayData(arrayData.map((d) => {
                            d.state = STATES.default;
                            return d;
                        }));
                    }, speed);
                    searchTimers.current.push(timer);
                }

                setItemsProcessed((v) => v + 1);
            }, i * speed);

            searchTimers.current.push(timer);

            if (arrayData[i].value === parseInt(targetElement)) {
                break;
            }
        }
    }

    const changeState = (time, start, end, mid) => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                const narr = _.cloneDeep(arrayData);
                narr[start].state = STATES.processing;
                narr[end].state = STATES.processing;
                narr[mid].state = STATES.mid;
                setArrayData(narr);
                setItemsProcessed(val => val + 1);
                resolve(narr);
            }, time);
            searchTimers.current.push(timer);
        })
    }


    const handleBinarySearch = async () => {
        if (targetElement.length === 0) {
            return;
        }

        resetSearch();

        let asc = true, desc = true;
        for (let i = 1; i < arrayData.length; i++) {
            if (arrayData[i].value < arrayData[i - 1].value) {
                asc = false;
            }
        }
        for (let i = 1; i < arrayData.length; i++) {
            if (arrayData[i].value > arrayData[i - 1].value) {
                desc = false;
            }
        }

        if (!asc && !desc) {
            setError("The elements are not in sorted order");
            return;
        }

        let dir = asc ? "ASC" : "DESC";
        setSearchMethod("Binary Search");

        let i = 0;

        for (let start = 0, end = arrayData.length - 1; start <= end; i++) {
            let mid = Math.floor(start + (end - start) / 2);

            await changeState(i === 0 ? 0 : speed, start, end, mid);

            if (arrayData[mid].value === parseInt(targetElement)) {
                const timer = setTimeout(() => {
                    const narr = _.cloneDeep(arrayData);
                    narr[mid].state = STATES.target;
                    setArrayData(narr);
                }, speed);
                searchTimers.current.push(timer);
                break;
            }

            if (dir === "ASC") {
                if (parseInt(targetElement) > arrayData[mid].value) {
                    start = mid + 1;
                } else if (parseInt(targetElement) < arrayData[mid].value) {
                    end = mid - 1;
                }
            } else {
                if (parseInt(targetElement) > arrayData[mid].value) {
                    end = mid - 1;
                } else if (parseInt(targetElement) < arrayData[mid].value) {
                    start = mid + 1;
                }
            }
        }

    }

    const handleRemoveElement = (id) => {
        resetSearch();

        const newArr = arrayData.filter((data) => data.id !== id);
        setArrayData(newArr);
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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <TextField value={element} inputMode="numeric" onChange={handleInput} size='small' label='Enter element' onKeyDown={handleEnterKey} disabled={arrayData.length > 25} />
                    <Button variant='contained' sx={{ marginLeft: '10px' }} onClick={handleAddItem}>Add</Button>
                    <Button variant='outlined' sx={{ marginLeft: '10px' }} onClick={(e) => { resetSearch(); setArrayData([]); }}>Clear All</Button>
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
                                resetSearch();
                                setSpeed(e.target.value);
                            }}
                            valueLabelFormat={(e) => (e / 1000) + " seconds"}
                        />
                    </Box>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <TextField value={targetElement} inputMode="numeric" onChange={handleTargetInput} size='small' label='Enter target element' disabled={arrayData.length === 0} />
                    <Button disabled={arrayData.length === 0} variant='contained' sx={{ marginLeft: '10px' }} onClick={handleLinearSearch} >Linear Search</Button>
                    <Button disabled={arrayData.length === 0} variant='contained' sx={{ marginLeft: '10px' }} onClick={handleBinarySearch} >Binary Search</Button>
                </div>

            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '50px',
                height: 130,
                border: '1px solid #ccc',
                padding: '0px 10px'
            }}>
                {arrayData.length === 0 && <p style={{
                    color: '#ccc'
                }}>Please add some element.</p>}
                {arrayData.map((item) => {
                    return (
                        <div key={item.id} style={{
                            padding: '8px',
                            marginLeft: '10px',
                            backgroundColor: item.state.backgroundColor,
                            color: item.state.textColor,
                            borderWidth: '1px',
                            borderColor: item.state.borderColor,
                            borderStyle: 'solid',
                            cursor: 'pointer',
                            transition: 'all ease-in 0.5s',
                            borderRadius: '10px',
                        }} onDoubleClick={(e) => handleRemoveElement(item.id)}>{item.label}</div>
                    )
                })}
            </div>

            <div style={{
                marginTop: '50px'
            }}>
                <p>Total Elements (n) = {arrayData.length}</p>
                {searchMethod === 'Linear Search' && <p>Time Complexity : O(n) = O({itemsProcessed})</p>}
                {searchMethod === 'Binary Search' && <p>Time Complexity : O(log(n)) = O(log({itemsProcessed}))</p>}
            </div>

        </div>
    )
}

export default Searching;