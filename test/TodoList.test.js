const { assert } = require("chai");
const TodoList = artifacts.require('./TodoList.sol')


beforeEach(async () => {
    this.todoList = await TodoList.deployed()
    accounts = await web3.eth.getAccounts();
})

describe('TodoList', () => {
    it('Deploys a contract', async () => {
        const address = await this.todoList.address
        assert.ok(address);
    })

    it('List tasks', async () => {
        const taskCount = await this.todoList.taskCount()
        const task = await this.todoList.tasks(taskCount)
        assert.equal(task.id.toNumber(), taskCount.toNumber())
        assert.equal(task.completed, false)
    })

    it('Has a default task', async () => {
        const task = await this.todoList.tasks(1)
        assert.equal(task[1], 'Default task')

    })

    it('Create tasks succesfully', async () => {
        const result = await this.todoList.addTask('New test task')
        const taskCount = await this.todoList.taskCount()
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), taskCount)
        assert.equal(event.description, 'New test task')
        assert.equal(event.completed, false)

    })

    it('Toggles tasks correctly', async () => {
        const result = await this.todoList.toggleTask(1)
        const task = await this.todoList.tasks(1)
        assert.equal(task.completed, true)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), 1)
        assert.equal(event.completed, true)
    })

    it('Deletes tasks succesfully', async () => {
        const taskCount = await this.todoList.taskCount()
        const result = await this.todoList.deleteTask(taskCount)
        const event = result.logs[0].args
        assert.equal(taskCount.toNumber(), event.id.toNumber())
        //console.log(event.id.toNumber())

    })

    it('Deletes specific tasks', async () => {
        //Mejorar

        const result1 = await this.todoList.deleteTask(2)
        const result2 = await this.todoList.deleteTask(3)
        const result3 = await this.todoList.deleteTask(5)

        // Validar si el tasks[id] si sea 0
        const task = await this.todoList.tasks(1)
        
    } )// .timeout(10000)

    it('Cannot access with other addresses', async () => {
        const addressConnected = accounts[1]
        const owner = await this.todoList.owner()
        //console.log('addres connected: ', addressConnected)
        //console.log('the owner is: ', owner)
        assert.notEqual(addressConnected, owner)
    })

})
