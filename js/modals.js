function launchNoLoginModal(title){
  // if accounts = [] instruct the user to log in to metamask and refesh the page.
  var html = '<div class="modal fade" id="no-login-modal" tabindex="-1" role="dialog" aria-labelledby="no-login" aria-hidden="true" style="display:none;">';
  html += 		'<div class="modal-dialog modal-dialog-centered" role="document">';
  html += 			'<div class="modal-content" style="opacity:0.95; background-color:grey; color:white;">';
  html += 				'<div class="modal-header">';
  html += 					'<h5 class="modal-title" id="no-login">Welcome to ' + title.toString() + '!</h5>';
  html += 					'<button type="button" class="close" onClick="closeModal(' + "'no-login-modal'" + ')" aria-label="Close">';
  html += 						'<span aria-hidden="true">&times;</span>';
  html += 					'</button>';
  html += 				'</div>';
  html += 				'<div class="modal-body">';
  var catchLine;
  title === 'EOSBet Proof-of-Concept Dice' ? catchLine = 'rolling!' : title === 'EOSBet Proof-of-Concept Slots' ? catchLine = 'spinning!' : catchLine = 'collecting some dividends!';
  html += 					'<text>Hello and welcome to ' + title.toString() + "! It seems you haven't logged in to MetaMask. Please log in to MetaMask, refresh the page, and then start " + catchLine + '</text>';
  html += 					'<br />';
  html += 				'</div>';
  html += 				'<div class="modal-footer">';
  html += 					'<button type="button" class="btn btn-secondary" style="background-color:black;" onClick="closeModal(' + "'no-login-modal'" + ')">Close</button>';
  html += 				'</div>';
  html += 			'</div>';
  html += 		'</div>';
  html += 	'</div>';

  $('#modal-div').html(html);
  $('#no-login-modal').modal('show');
}

function launchNoMetaMaskModal(title){
  // if no metamask installed, launch a modal explaining MetaMask with an install
  var html = '<div class="modal fade" id="no-metamask-modal" tabindex="-1" role="dialog" aria-labelledby="no-metamask" aria-hidden="true" style="display:none;">';
  html += 		'<div class="modal-dialog modal-dialog-centered" role="document">';
  html += 			'<div class="modal-content" style="opacity:0.95; background-color:grey; color:white;">';
  html += 				'<div class="modal-header">';
  html += 					'<h5 class="modal-title" id="no-metamask">Welcome to ' + title.toString() + '!</h5>';
  html += 					'<button type="button" class="close" onClick="closeModal(' + "'no-metamask-modal'" + ')" aria-label="Close">';
  html += 						'<span aria-hidden="true">&times;</span>';
  html += 					'</button>';
  html += 				'</div>';
  html += 				'<div class="modal-body">';
  html += 					'<text>Hello and welcome to ' + title.toString() + "! It seems as if you don't have MetaMask installed. MetaMask is a browser based Ethereum wallet, that allows you to interact with the blockchain from our website and play our games.</text>";
  html += 					'<br /><br />';
  html += 					'<text>Please download MetaMask, and then fund your MetaMask wallet with Ether. Please see our <a href="/support.html" style="color:#ABDCFF;">FAQ & Support Page</a> for more details!</text>';
  html += '<br /><br />';
  html += 					'<a href="https://metamask.io" style="background-color:orange;" target="_blank" class="btn btn-secondary" id="metamask-button"><img src="/img/Metamask Head @1x.png" width="30" height="30">&emsp;<b>Install MetaMask</b></a>';
  html += 				'</div>';
  html += 				'<div class="modal-footer">';
  html += 					'<button type="button" class="btn btn-secondary" style="background-color:black;" onClick="closeModal(' + "'no-metamask-modal'" + ')">Close</button>';
  html += 				'</div>';
  html += 			'</div>';
  html += 		'</div>';
  html += 	'</div>';

  $('#modal-div').html(html);
  $('#no-metamask-modal').modal('show');
}

function launchWrongNetworkModal(title){
  // if the user is not on ropsten (CHANGE TO MAINNET ON LAUNCH!!!) then notify the user with a modal stating this
  var html = '<div class="modal fade" id="wrong-network-modal" tabindex="-1" role="dialog" aria-labelledby="wrong-network" aria-hidden="true" style="display:none;">';
  html += '<div class="modal-dialog modal-dialog-centered" role="document">';
  html += '<div class="modal-content" style="opacity:0.95; background-color:grey; color:white;">';
  html += '<div class="modal-header">';
  html += '<h5 class="modal-title" id="wrong-network">Wrong Network!</h5>';
  html += '<button type="button" class="close" onClick="closeModal(' + "'wrong-network-modal'" + ')" aria-label="Close">';
  html += '<span aria-hidden="true">&times;</span>';
  html += '</button>';
  html += '</div>';
  html += '<div class="modal-body">';
  var catchLine;
  title === 'EOSBet Proof-of-Concept Dice' ? catchLine = 'rolling!' : title === 'EOSBet Proof-of-Concept Slots' ? catchLine = 'spinning!' : catchLine = 'collecting some dividends!';
  html += '<text>Hello and welcome to ' + title.toString() + '! It seems you are on the wrong Ethereum network! Please change the network to the Mainnet, refresh the page, and then start ' + catchLine + '</text>';
  html += '<br />';
  html += '</div>';
  html += '<div class="modal-footer">';
  html += '<button type="button" class="btn btn-secondary" style="background-color:black;" onClick="closeModal(' + "'wrong-network-modal'" + ')">Close</button>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  $('#modal-div').html(html);
  $('#wrong-network-modal').modal('show');
}

function launchGamePausedModal(title){
  // notify a user if the games are paused
  var html = '<div class="modal fade" id="game-paused-modal" tabindex="-1" role="dialog" aria-labelledby="game-paused" aria-hidden="true" style="display:none;">';
  html += '<div class="modal-dialog modal-dialog-centered" role="document">';
  html += '<div class="modal-content" style="opacity:0.95; background-color:grey; color:white;">';
  html += '<div class="modal-header">';
  html += '<h5 class="modal-title" id="game-paused">Game is currently Paused!</h5>';
  html += '<button type="button" class="close" onClick="closeModal(' + "'game-paused-modal'" + ')" aria-label="Close">';
  html += '<span aria-hidden="true">&times;</span>';
  html += '</button>';
  html += '</div>';
  html += '<div class="modal-body">';
  html += '<text>Hello and welcome to ' + title.toString() + '! This game is currently paused, but please check back later!</text>';
  html += '<br />';
  html += '</div>';
  html += '<div class="modal-footer">';
  html += '<button type="button" class="btn btn-secondary" style="background-color:black;" onClick="closeModal(' + "'game-paused-modal'" + ')">Close</button>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  $('#modal-div').html(html);
  $('#wrong-network-modal').modal('show');
}

function closeModal(id){
  // remove all the different aspects to the modal...
  // hide modal -> remove backdrop -> remove scroll lock -> clear out html
  $('#' + id).modal('hide');
  $('.modal-backdrop').remove();
  $('body').removeClass('modal-open');
  $('#modal-div').html('');
}
