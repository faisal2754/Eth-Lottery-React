import './app.css'
import React, { Component } from 'react'
import { Box, Button, Container, TextField } from '@material-ui/core'

import lottery from './lottery'

import web3 from './web3'

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  }

  getUsefulInfo = async () => {
    const players = await lottery.methods.getPlayers().call()
    const balance = await web3.eth.getBalance(lottery.options.address)
    return { players, balance }
  }

  async componentDidMount() {
    const manager = await lottery.methods.manager().call()
    const { players, balance } = await this.getUsefulInfo()

    this.setState({ manager, players, balance })
  }

  onSubmit = async (event) => {
    event.preventDefault()

    const accounts = await web3.eth.getAccounts()

    this.setState({ message: 'Processing transaction...' })

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    })

    this.setState({ value: '' })
    const { players, balance } = await this.getUsefulInfo()
    this.setState({ message: 'You have been entered!', players, balance })
  }

  onClick = async () => {
    const accounts = await web3.eth.getAccounts()

    this.setState({ message: 'Processing transaction...' })

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    })

    const { players, balance } = await this.getUsefulInfo()
    this.setState({ message: 'A winner has been picked!', players, balance })
  }

  render() {
    return (
      <div className="app">
        <div className="app__info">
          <h1>Lottery Contract</h1>
          <p>
            This contract is managed by {this.state.manager}. There are currently{' '}
            {this.state.players.length} people entered, competing to win{' '}
            {web3.utils.fromWei(this.state.balance, 'ether')} ether!
          </p>
        </div>

        <div className="app__enter">
          <h3>Want to try your luck?</h3>
          <div className="app__enterForm">
            <form onSubmit={this.onSubmit}>
              <div>
                <TextField
                  id="filled-basic"
                  label="Enter Eth amount"
                  variant="filled"
                  value={this.state.value}
                  onChange={(event) => this.setState({ value: event.target.value })}
                />
              </div>
              <Button id="btn_form" type="submit" variant="contained" color="secondary">
                Enter
              </Button>
            </form>
          </div>
        </div>

        <div className="app__winner">
          <h3>Ready to pick a winner? (Manager only)</h3>
          <Button variant="outlined" color="inherit" onClick={this.onClick}>
            Pick a winner
          </Button>

          <h1>{this.state.message}</h1>
        </div>
      </div>
    )
  }
}
export default App
