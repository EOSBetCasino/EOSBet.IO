function getTransactionReceiptMined(txHash) {
  var transactionReceiptAsync = function(resolve, reject) {
    web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
      if (error) {
        reject(error);
      }
      else if (receipt == null) {
        setTimeout(
          () => transactionReceiptAsync(resolve, reject), 500);
      }
      else {
        resolve(receipt);
      }
    });
  };
  return new Promise(transactionReceiptAsync);
};

function hexToBinary(hexString){
  var hexAlphabet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  var binaryAlphabet = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111'];

  var binaryString = '';
  var hexChar;
  var binaryChar;
  for (var i = 0; i < hexString.length; i++){
    hexChar = hexString.charAt(i);
    binaryChar = binaryAlphabet[hexAlphabet.indexOf(hexChar)];

    binaryString += binaryChar;
  }

  return binaryString;
}

const EOSBetDice = {
  // START CONTRACT DATA
  maxRolls: 1024, // this is hard coded into the contract.
  maxWinPerSpin: null,
  minBet: null,
  houseEdge: 10,
  player: null, // players ethereum address.
  playerBalance: null, // players balance in wei
  // data when credits are purchased.
  betPerRoll: null,
  totalRolls: null,
  rollUnder: null,
  totalBet: null,
  currentProfit: null,
  // data when credits are given by oraclize
  onRoll: null,
  rollData: null,
  // web3 stuff
  web3Provider: null,
  Dice: null,
  diceInstance: null,

  init: function() {
    EOSBetDice.initWeb3();
    EOSBetDice.bindInitialEvents();
  },

  initWeb3: function() {
    setTimeout(function(){
      if (typeof web3 !== 'undefined'){
        console.log('getting web3');
        EOSBetDice.web3Provider = web3.currentProvider;

        web3.version.getNetwork((error, result) => {
          if (error || result !== '4'){
            launchWrongNetworkModal('EOSBet Proof-of-Concept Dice');
            return;
          }
          else {
            // if everything is ok, then get contract details
            return EOSBetDice.initContract(web3);
          }
        });


      }
      else {
        launchNoMetaMaskModal('EOSBet Proof-of-Concept Dice');
        return;
      }
    }, 500);
  },

  initContract: function(web3){
    $.getJSON('./abi/DiceABI.json', function(data){
      // get contract ABI and init
      var diceAbi = data;

      EOSBetDice.Dice = web3.eth.contract(diceAbi);
      EOSBetDice.diceInstance = EOSBetDice.Dice.at('0x5284E4F0CD82276B95fE7902923D24cec57CC51c');

      return EOSBetDice.getContractDetails(web3);

    });
  },

  getContractDetails: function(web3){
    // get amount wagered
    EOSBetDice.diceInstance.AMOUNTWAGERED.call(function(error, result){
      if (error){
        console.log('could not retreive balance!');
      }
      else {
        $('#amt-wagered').html(web3.fromWei(result, 'ether').toString().slice(0, 7));
      }
    });

    // get games played
    EOSBetDice.diceInstance.GAMESPLAYED.call(function(error, result){
      if (error){
        console.log('could not get games played');
      }
      else {
        $('#games-played').html(result.toString());
      }
    });

    // get max win per spin

    EOSBetDice.diceInstance.getMaxWin(function(error, result){
      if (error){
        console.log('could not get bankroll!');
      }
      else {
        $('#max-win').html(web3.fromWei(result, 'ether').toString().slice(0, 7));
        EOSBetDice.maxWinPerSpin = result;
      }
    });

    // get min bet per spin
    EOSBetDice.diceInstance.MINBET.call(function(error, result){
      if (error){
        console.log('could not get min bet');
      }
      else {
        EOSBetDice.minBet = result;
        $('#min-bet').text(web3.fromWei(result, 'ether').toString().slice(0, 7));
      }
    });

    // get house edge
    EOSBetDice.diceInstance.HOUSEEDGE_inTHOUSANDTHPERCENTS.call(function(error, result){
      if (error){
        console.log('could not get game paused');
      }
      else {
        EOSBetDice.houseEdge = new BigNumber(result.dividedBy(10));
      }
    });

    // get if game is paused and launch modal
    EOSBetDice.diceInstance.GAMEPAUSED.call(function(error, result){
      if (error){
        console.log('could not get game paused');
      }
      else {
        if (result === true){
          launchGamePausedModal('EOSBet Proof-of-Concept Dice');
        }
      }
    });

    return EOSBetDice.getPlayerDetails(web3);
  },

  getPlayerDetails: function(web3){
    var accounts = web3.eth.accounts;
    if (accounts.length === 0){
      launchNoLoginModal('EOSBet Proof-of-Concept Dice');
    }
    else {
      var playersAccount = accounts[0];
      $('#players-address').html(String(playersAccount));

      // get players balance in ether
      web3.eth.getBalance(playersAccount, function(error, result){
        if (error) {
          console.log('could not get players balance');
        }
        else {
          $('#players-balance').html(web3.fromWei(result, 'ether').toString());
          EOSBetDice.playerBalance = result;
        }
      });
      EOSBetDice.player = playersAccount;
    }
  },

  bindInitialEvents: function() {
    $('#buy-rolls').click(function() {
      EOSBetDice.buyRolls();
    });
    $('#roll-dice').click(function() {
      EOSBetDice.rollDice();
    });
  },

  buyRolls: function(){
    // from sliders
    EOSBetDice.rollUnder = rollUnderValue();
    EOSBetDice.totalRolls = numberRollsValue();
    // amount bet
    EOSBetDice.betPerRoll = new BigNumber(web3.toWei($('#bet-per-roll').val(), 'ether'));
    // total amt to send
    EOSBetDice.totalBet = new BigNumber(EOSBetDice.betPerRoll.times(guaranteedRollsValue()).toFixed(0));

    EOSBetDice.onRoll = 0;

    var player = EOSBetDice.getPlayerDetails(web3);

    EOSBetDice.diceInstance.play(EOSBetDice.betPerRoll.toString(), EOSBetDice.totalRolls.toString(), EOSBetDice.rollUnder.toString(), {value: EOSBetDice.totalBet.toString(), from: player}, async function(error, result){
      if (error){
        console.log('error while purchasing rolls ---', error);
      }
      else {
        $('#game-info').show();
        $('#game-info').html('Transaction waiting to be mined...');
        var txHash = result;
        var txReceipt = await getTransactionReceiptMined(txHash);

        // now parse the logs to determine if the transaction was already resolved, or was sent to oraclize
        // for miner-proof randomness...
        if (txReceipt.logs.length === 0){
          $('#game-info').removeClass('alert-info').addClass('alert-danger');
          $('#game-info').html('UH OH! Transaction seemed to fail! Please try again or check etherscan for more info...');
        }
        // if there is a single log, then the transaction was resolved internally.
        // now we just need to parse the game data and play some dice!
        else if (txReceipt.logs.length === 1){

          var data = txReceipt.logs[0]['data'];

          console.log('all data', data);

          EOSBetDice.parseRolls(data);
        }
        // if there was two logs, then the bettor bet enough for the call to get forwarded to oraclize
        // get the oraclize query id, and then watch for an event with this id.
        else if (txReceipt.logs.length === 2){
          $('#game-info').removeClass('alert-info').addClass('alert-success');
          $('#game-info').html('Transaction mined! Please wait, fetching provable randomness from our provider...');

          var resultTopic = '0xb9d44d01b9e36e98413c2ed40b61f560e40595343f3cc734c988da4db5dd6563';
          var ledgerProofFailTopic = '0x2576aa524eff2f518901d6458ad267a59debacb7bf8700998dba20313f17dce6';
          var oraclizeQueryId = txReceipt.logs[1]['topics'][1];

          var watchForResult = web3.eth.filter({topics: [resultTopic, oraclizeQueryId], fromBlock: 'pending', to: EOSBetDice.diceInstance.address});
          var watchForFail = web3.eth.filter({topics: [ledgerProofFailTopic, oraclizeQueryId], fromBlock: 'pending', to: EOSBetDice.diceInstance.address});

          watchForResult.watch(function(error, result){
            if (error){
              console.log('error while fetching result event', error);
            }
            else {

              watchForResult.stopWatching();
              watchForFail.stopWatching();

              var data = result.data;

              EOSBetDice.parseRolls(data);
            }
          });

          watchForFail.watch(function(error, result){
            if (error){
              console.log('ledger proof failed, but error', error);
            }
            else {
              watchForResult.stopWatching();
              watchForFail.stopWatching();
              $('#game-info').removeClass('alert-success').addClass('alert-danger');
              $('#game-info').html('We apologize, but the random number has not passed our test of provable randomness, so all your ether has been refunded. Please feel free to play again, or read more about our instantly provable randomness generation <a href="/support.html">here</a>. We strive to bring the best online gambling experience at EOSBet.IO, and occasionally the random numbers generated do not pass our stringent testing.');
            }
          });
        }
      }
    });
  },

  parseRolls: function(data){
    // NOTE: fade out roll selection screen, fade in the roll screen
    $('#game-info').hide();
    $('#roll-dice').show();

    EOSBetDice.currentProfit = EOSBetDice.totalBet;

    rollsReady(EOSBetDice.betPerRoll, EOSBetDice.totalBet, EOSBetDice.totalRolls, EOSBetDice.rollUnder);

    // get the amount of rolls that actually happened from the logs
    var rolls = parseInt(data.slice(2, 66), 16);

    // get the roll data (in a hex string, convert to binary)..
    // then we need to slice this string again, because after the rolls are done, it will all be 00000000
    EOSBetDice.rollData = hexToBinary(data.slice(66, 322)).slice(0, rolls);
  },

  rollDice: async function(){
    var win = EOSBetDice.rollData.charAt(EOSBetDice.onRoll) === '1';

    var houseEdgeMult = ((100 - EOSBetDice.houseEdge) / 100).toString();
    var profitMult = (100 / (EOSBetDice.rollUnder - 1)).toString();

    var winSize = EOSBetDice.betPerRoll.times(profitMult).times(houseEdgeMult).minus(EOSBetDice.betPerRoll);
    console.log('rollin...');

    // increment or decrement current profit based on win or not
    win ? EOSBetDice.currentProfit = EOSBetDice.currentProfit.add(winSize) : EOSBetDice.currentProfit = EOSBetDice.currentProfit.minus(EOSBetDice.betPerRoll);

    EOSBetDice.onRoll += 1;

    await rollingDice(win, EOSBetDice.rollUnder, winSize, EOSBetDice.onRoll, EOSBetDice.totalRolls, EOSBetDice.betPerRoll, EOSBetDice.currentProfit);
  },

  calculateMaxBet: function(rollUnder){
    // stay on the safe side so rolls don't fail...
    var profitMult = (100 / (rollUnderValue() - 1)).toString();
    var maxBet = EOSBetDice.maxWinPerSpin.dividedBy(profitMult).times(0.98);

    return web3.fromWei(maxBet, 'ether');
  },

  calculateMinBet: function(){
    return web3.fromWei(EOSBetDice.minBet, 'ether');
  },

  calculateProfit: function(betPerRoll, rollUnder){
    var profit = (100 / (rollUnder - 1) * ((100 - EOSBetDice.houseEdge) / 100));
    console.log('profit', profit);
    return profit;
  },
};

$(document).ready(function(){
  initUI();
  EOSBetDice.init();

});

var rollCountValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1024];

function initUI(){
  // values for number rolls slider

  // number rolls slider
  $('#number-rolls').slider({
    orientation: 'horizontal',
    range: 'min',
    min: 0,
    max: rollCountValues.length - 1,
    value: 9,
    create: function(){
      $('#current-number-rolls').text(rollCountValues[$(this).slider('value')]);
    },
    slide: function(event, ui){
      $('#current-number-rolls').text(rollCountValues[ui.value].toString());
      updateGuaranteedRollsSlider_withUIInput(ui);
    },
  });

  // max and min buttons, double/half buttons
  $('#max-bet-per-roll').click(function(){
    var maxBet = EOSBetDice.calculateMaxBet(parseFloat(rollUnderValue()));
    $('#bet-per-roll').val(maxBet.toString());

    updateGuaranteedRollsSlider_withFixedRolls();
  });

  $('#double-bet-per-roll').click(function(){
    var maxBet = EOSBetDice.calculateMaxBet(parseFloat(rollUnderValue()));
    var doubleBet = parseFloat($('#bet-per-roll').val()) * 2;

    if (maxBet < doubleBet){
      $('#bet-per-roll').val(maxBet);
    }
    else {
      $('#bet-per-roll').val(doubleBet);
    }

    updateGuaranteedRollsSlider_withFixedRolls();
  });

  $('#half-bet-per-roll').click(function(){
    var minBet = EOSBetDice.calculateMinBet();
    var halfBet = parseFloat($('#bet-per-roll').val()) / 2;

    if (minBet > halfBet){
      $('#bet-per-roll').val(minBet);
    }
    else {
      $('#bet-per-roll').val(halfBet);
    }

    updateGuaranteedRollsSlider_withFixedRolls();
  });

  $('#min-bet-per-roll').click(function(){
    $('#bet-per-roll').val(EOSBetDice.calculateMinBet());

    updateGuaranteedRollsSlider_withFixedRolls();
  });

  $('#bet-per-roll').on('input', function(){
    updateGuaranteedRollsSlider_withFixedRolls();
  });

  // roll under slider
  $('#roll-under').slider({
    orientation: 'horizontal',
    range: 'min',
    min: 2,
    max: 99,
    value: 50,
    create: function(){
      $('#current-roll-under').text($(this).slider('value'));
    },
    slide: function(event, ui){
      $('#current-roll-under').text(ui.value);

      var maxBet = EOSBetDice.calculateMaxBet(parseFloat(ui.value));

      if ($('#bet-per-roll').val() > maxBet){
        $('#bet-per-roll').val(maxBet);
      }
      insertProfitPerRoll(ui.value);

      updateGuaranteedRollsSlider_withFixedRolls();
    },
  });

  $('#guaranteed-rolls').slider({
    orientation: 'horizontal',
    range: 'min',
    min: 1,
    max: 10,
    value: 10,
    create: function(){
      $('#current-guaranteed-rolls').text($(this).slider('value'));
    },
    slide: function(event, ui){
      $('#current-guaranteed-rolls').text(ui.value);
    },
  });

  // tool tip to explain total bet
  $('#guaranteed-rolls-tooltip').tooltip();
}

// /// helper functions to get the slider values //////
function rollUnderValue(){
  return $('#roll-under').slider('option', 'value');
}

function guaranteedRollsValue(){
  return $('#guaranteed-rolls').slider('option', 'value');
}

function numberRollsValue(){
  return rollCountValues[$('#number-rolls').slider('option', 'value')];
}
// /////////////////////////////////////////////////////


function insertProfitPerRoll(rollUnderValue){
  var profit = EOSBetDice.calculateProfit(parseFloat($('#bet-per-roll').val()), rollUnderValue);
  $('#current-profit-per-roll').html(profit.toString().slice(0, 4) + 'x');
}

function updateGuaranteedRollsSlider_withUIInput(ui){
  var numberRolls = rollCountValues[ui.value];

  updateGuaranteedRollsSlider(numberRolls);
}

function updateGuaranteedRollsSlider_withFixedRolls(){
  var numberRolls = rollCountValues[$('#number-rolls').slider('option', 'value')];

  updateGuaranteedRollsSlider(numberRolls);
}

function updateGuaranteedRollsSlider(numberRolls){
  var betPerRoll = parseFloat($('#bet-per-roll').val());

  if (!isNaN(betPerRoll) && betPerRoll !== 0){
    var maxPossibleRolls = Math.floor(web3.fromWei(EOSBetDice.playerBalance, 'ether') / betPerRoll);

    if (maxPossibleRolls < numberRolls){
      // change the max value to the max rolls possible
      $('#guaranteed-rolls').slider('option', 'max', maxPossibleRolls);

      if ($('#guaranteed-rolls').slider('option', 'value') > maxPossibleRolls){
        $('#guaranteed-rolls').slider('option', 'value', maxPossibleRolls);
      }
    }
    else {
      // change the max value to the number of rolls, cause the bettor has enough ether to get all the rolls
      $('#guaranteed-rolls').slider('option', 'max', numberRolls);

      if ($('#guaranteed-rolls').slider('option', 'value') > numberRolls){
        $('#guaranteed-rolls').slider('option', 'value', numberRolls);
      }
    }

    $('#current-guaranteed-rolls').text($('#guaranteed-rolls').slider('option', 'value'));
  }
}

function rollsReady(betPerRoll, totalProfit, maxRolls, rollUnder){
  // set values initially...
  $('#bet-size').text(web3.fromWei(betPerRoll, 'ether').slice(0, 8));
  $('#current-profit').text(web3.fromWei(totalProfit, 'ether').slice(0, 8));
  $('#max-rolls').text('0' + '/' + maxRolls.toString().slice(0, 8));
  $('#lucky-number').html(rollUnder.toString().slice(0, 8));

  // TODO: fade in and then fade out, instead of harsh hide <-> show
  $('#place-bets').hide();
  $('#roll-bets').show();
}

async function rollingDice(win, rollUnder, winSize, onRoll, totalRolls, betPerRoll, currentProfit){
  // disable the ROLL button
  $('#roll-dice').addClass('disabled');
  $('#roll-dice').off('click');

  var thisRoll;

  // break if the rolls are completed.
  if (onRoll > totalRolls){
    if (onRoll < totalRolls) $('#roll-dice').removeClass('disabled');
    $('#roll-dice').click(() => {
      EOSBetDice.rollDice();
    });

    return;
  }

  // do a simple animation
  var interval = 10;
  var rollAnimation = function(){

    // if the interval is small, then show a random number and increment the interval, then set another timeout with new interval
    if (interval < 400){

      interval *= 1.15;
      $('#your-number').text(Math.floor(Math.random() * 100) + 1);

      setTimeout(rollAnimation, interval);
    }
    // if the interval is large, then end the animation.
    // if the bettor won, then choose a random number below the rollUnder, and update the UI
    // if the bettor lost, then choose a random number above the rollUnder, ...

    else {
      var cssColor;

      if (!win){
        thisRoll = Math.floor(Math.random() * (100 - rollUnder) + (rollUnder + 1));

        $('#your-number').text(thisRoll);
        cssColor = {color: '#ff1919'};
      }
      else {
        thisRoll = Math.floor(Math.random() * (rollUnder - 1) + 1);

        $('#your-number').text(thisRoll);
        cssColor = {color: '#09d602'};
      }
      // update ticker and re-enable button
      setTimeout(() => {

        updateTicker(onRoll, totalRolls, currentProfit, cssColor);

        if (onRoll < totalRolls) $('#roll-dice').removeClass('disabled');

        $('#roll-dice').click(() => {
          EOSBetDice.rollDice();
        });

      }, 500);

      // enable the ROLL button once the roll has resolved.

      checkGameStatus(onRoll, totalRolls, currentProfit, betPerRoll);
    }
  };
  // start the timeout function
  setTimeout(rollAnimation, interval);
}

// purely a helper function for rolling dice to increment the ticker values.
function updateTicker(onRoll, totalRolls, currentProfit, cssColor){
  // increment the roll number color: white -> cssColor -> white
  $('.in-game-stats').css(cssColor);

  $('#max-rolls').text(onRoll.toString() + '/' + totalRolls.toString());
  $('#current-profit').text(web3.fromWei(currentProfit, 'ether').slice(0, 8));

  setTimeout(() => {
    $('.in-game-stats').css({color: 'white'});
  }, 500);
}

function checkGameStatus(onRoll, totalRolls, currentProfit, betPerRoll){
  // check if the game has to end due to bankrupt player, or roll limit reached
  if (onRoll >= totalRolls || currentProfit.lessThan(betPerRoll)){

    $('#roll-dice').addClass('disabled');
    // TODO: animations needed
    setTimeout(() => {
      $('#roll-bets').hide();
      $('#place-bets').show();
      $('#roll-dice').removeClass('disabled');
    }, 5000);
  }
}
