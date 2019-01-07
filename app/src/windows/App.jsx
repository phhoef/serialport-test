import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import { Dropdown, Icon } from 'semantic-ui-react';

class App extends Component {
    constructor() {
        super();

        this.state = {  ports: [], selectedPort: '' }

        ipcRenderer.on('response-serial-ports', (e, ports) => {
            const arduinos = ports.filter(
                p => p.manufacturer && p.manufacturer.includes('Arduino')
            );
            if (arduinos.length > 0)
                this.setState({
                    ports: arduinos,
                    selectedPort: JSON.stringify(arduinos[0])
                })
        })
    }

    componentDidMount() {
        this.requestSerialPorts();
    }

    requestSerialPorts() {
        ipcRenderer.send('request-serial-ports');
    }

    handlePortChanged = (event, data) => {
        this.setState({ selectedPort: data.value });
    }

    render() {
        const ports = this.state.ports.map(p => ({
            key: p.comName,
            text: p.comName,
            value: JSON.stringify(p)
        }));

        return (
            <div>
                This is my Test App
                <Dropdown
                        options={ports}
                        value={this.state.selectedPort}
                        onChange={this.handlePortChanged}
                    />
                <Icon
                    name='refresh'
                    link
                    onClick={this.requestSerialPorts}
                />
            </div>
        );
    }
}

export default App