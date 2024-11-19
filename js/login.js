/*

author : Carlo O. Dominguez

*/

let ajax = {
	
	/*
	socket:io(),
	*/
		
	//main func

        
    getMsg:()=>{
        
        ajax.socket.on('logged', (msg) => {
			
            util.Toast(msg,3000)
            util.clearBox()
            /*
            var item = document.getElementById("xmsg")
            item.textContent = msg
            */
          })
    },
    
	
	get Bubbles(){
		const placeholder = document.querySelector('.particle-bg')
		let xpan = "<span></span>"
		
		for (var i = 1; i < 11; i++) {
			xpan+= "<span></span>"
		}
		
      
        placeholder.append(xpan)
	},
	
	testvar:'hey, testvar works',
		
	get test(){
		console.log(`get func works! ${this.testvar}`)
		
	},
	
	triggerEvent: (el, type) => {
		// IE9+ and other modern browsers
		if ('createEvent' in document) {
			var e = document.createEvent('HTMLEvents');
			e.initEvent(type, false, true);
			el.dispatchEvent(e);
		} else {
			// IE8
			var e = document.createEventObject();
			e.eventType = type;
			el.fireEvent('on' + e.eventType, e);
		}
	},	
	
	nodeSay: (cVoice) => {
		const result = fetch(`/xapi/speak/${cVoice}`)
        //console.log(result)
	},
	
	//==,= main run
	init : async () => {
		await new Promise( resolve =>{
			setTimeout( ()=>{
				
				if (synth.onvoiceschanged !== undefined) {
					console.log('ONVOICESCHANGED')
					synth.onvoiceschanged = util.getVoice()
				}
				//ajax.getVoice()
				
				//start to emit who's logged    
				//ajax.getMsg()   
			    util.loadModals('loginModal','loginForm','#loginForm','loginPlaceHolder') //PRE-LOAD MODALS
				
				console.log('loading modals', util.Codes() )
				
				//util.Toast('System Ready', 2000)
				util.alertMsg('System Ready','warning','loginPlaceHolder')
			
				setTimeout(function(){
					document.getElementById('loginPlaceHolder').innerHTML="";
				}, 2000);

				//proxy property
				//ajax.test
								
				resolve()
			
			}, 1000)
		})
		
        util.modalShow('loginmodal');
		
	}//END MAIN
	
	
	
} //======================= end ajax obj==========//
//ajax.Bubbl
window.scrollTo(0,0);
ajax.init()
