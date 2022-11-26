const AppContract = '0xCA097DBAC199Cb894bfEdeb668275C441f99FBcd';
App = {

    contracts: {},
    loading: false,
    

  load: async () => {
    await App.loadWeb3()
    await App.loadAccounts()
    await App.loadContract()
    await App.render()
  },

  // From Metamask documentation
  loadWeb3: async () => {
    window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    });
  },


  loadAccounts: async () => {
    //App.account = await ethereum.request({method: 'eth_requestAccounts'})
    //console.log(App.account[0])

    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      // We are in the browser and metamask is running.
      App.account = await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
    } else {
      // We are on the server *OR* the user is not running metamask
      const provider = new Web3.providers.HttpProvider(
        "https://goerli.infura.io/v3/a674bf58761f459bb2c26f295b6f1a00"
      );
      web3 = new Web3(provider);
    }
  },

  loadContract: async () => {

    const todoList = await $.getJSON('TodoList.json')
    App.contracts.TodoList = TruffleContract(todoList)
    //App.contracts.TodoList.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    App.contracts.TodoList.setProvider(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/a674bf58761f459bb2c26f295b6f1a00"));
    App.todoList = await App.contracts.TodoList.deployed()
    //console.log(todoList)
  },


  render: async () => {

    if (App.loading){
        return
    }

    App.setLoading(true)

    $('#account').html(App.account)

    await App.renderTasks()

    App.setLoading(false)

    },

    renderTasks: async () => {

        const taskCount = await App.todoList.taskCount()
        const $taskTemplate = $(".taskTemplate");
        //console.log(taskCount)

        for (var i = 1; i <= taskCount; i++) {

          const task = await App.todoList.tasks(i)

          //console.log(task)

          const taskId = task[0].toNumber()
          const taskContent = task[1]
          const taskCompleted = task[2]

          const $newTaskTemplate = $taskTemplate.clone()
          $newTaskTemplate.find('.content').html(taskContent)
          $newTaskTemplate.find('input')
                          .prop('idTask', taskId)
                          .prop('checked', taskCompleted)
                          .on('click', App.toggleTask)

          $newTaskTemplate.find('label').attr("idTask", taskId);
          let idTask = $newTaskTemplate.find('label').attr('idTask');
          //console.log(idTask)

          if(idTask > 0){
            if (taskCompleted) {
              $('#completedTaskList').append($newTaskTemplate)
            } else {
              $('#taskList').append($newTaskTemplate)
            }
          }
          $newTaskTemplate.show()
        }
    },

    addTask: async () => {

      App.setLoading(true)
      const description = $('#newTask').val()
      console.log(description)

      const todoList = new web3.eth.Contract(App.contracts.TodoList.abi, 
                                            AppContract);
      await todoList.methods
        .addTask(description) 
        .send({ from: App.account[0] });

      //await App.todoList.addTask(description, { from: App.account[0] })
      window.location.reload()
    },

    toggleTask: async (event) => {

      App.setLoading(true)
      const taskId = event.target.idTask
      //console.log(taskId)

      //var privKey = '41e0474295dda285fd51856dc83fa357a9e6745ab397d009f9c6311bbbe3c185'
      //var wallet = new ethers.Wallet(privKey);
      // const resultToggle = await wallet.signTransaction({
      //   to: '0xca097dbac199cb894bfedeb668275c441f99fbcd',
      //   from: App.account[0]
      // })
      // var rpc = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/a674bf58761f459bb2c26f295b6f1a00');
      // rpc.sendTransaction(resultToggle)


      // const contract = new ethers.Contract( todoList, '0xca097dbac199cb894bfedeb668275c441f99fbcd' )
      // const tx = contract.methods.toggleTask(taskId);
      // const receipt = await tx.send({
      //   from: App.account[0],
      //   gas: await tx.estimateGas(),
      // })
      // .once("transactionHash", (txhash) => {
      //   console.log(`Mining transaction ...`);
      // });

      // const todoList = App.contracts.TodoList(this.props.address);
      // const todoList = App.contracts.TodoList('0xca097dbac199cb894bfedeb668275c441f99fbcd')

      const todoList = new web3.eth.Contract(App.contracts.TodoList.abi, AppContract);
      await todoList.methods
        .toggleTask(taskId) 
        .send({ from: App.account[0] });
      
      //await App.todoList.toggleTask(taskId, {  from: App.account[0] })

      window.location.reload()
    },

    deleteTask: async () => {

      App.setLoading(true)
      const idTask =await event.target.parentNode.parentNode.getAttribute('idTask')
      //console.log(idTask)

      const todoList = new web3.eth.Contract(App.contracts.TodoList.abi, AppContract);
      await todoList.methods
        .deleteTask(idTask) 
        .send({ from: App.account[0] });
      
      //await App.todoList.deleteTask(idTask, { from: App.account[0] })

      window.location.reload()
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')

        if (boolean){
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
};


$(() => {
  $(window).load(() => {
    App.load();
  });
});
