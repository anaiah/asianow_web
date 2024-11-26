/*
Author: Carlo Dominguez
1/31/2023
this is for utilities
modals,forms,utilities
*/
const requirements = document.querySelectorAll(".requirements")
const specialChars = "!@#$%^&*()-_=+[{]}\\| :'\",<.>/?`~"
const numbers = "0123456789"

let doc, doc_id, btn_id
let db = window.localStorage
let oldpwd = document.querySelector(".p1")
let nupwd = document.querySelector(".p2")
let lengBoolean, bigLetterBoolean, numBoolean, specialCharBoolean 
let leng = document.querySelector(".leng") 
let bigLetter = document.querySelector(".big-letter") 
let num = document.querySelector(".num") 
let specialChar = document.querySelector(".special-char") 
//speech synthesis
const synth = window.speechSynthesis
let xloginmodal,
xnewsitemodal,
xequipmenttagmodal
let voices = []
//first init delete all localstorage
db.clear()
const util = {
    grpid:null,
    scrollsTo:(cTarget)=>{
        const elem = document.getElementById(cTarget)
        elem.scrollIntoView()
    },
    //=========================START VOICE SYNTHESIS ===============
    getVoice: async () => {
        voices = synth.getVoices()
        console.log( 'GETVOICE()')
        voices.every(value => {
            if(value.name.indexOf("English")>-1){
                console.log( "bingo!-->",value.name, value.lang )
            }
        })
    },//end func getvoice
    //speak method
    speak:(theMsg)=> {
        console.log("SPEAK()")
        // If the speech mode is on we dont want to load
        // another speech
        if(synth.speaking) {
            //alert('Already speaking....');
            return;
        }	
        const speakText = new SpeechSynthesisUtterance(theMsg);
        // When the speaking is ended this method is fired
        speakText.onend = e => {
            //console.log('Speaking is done!');
        };
        // When any error occurs this method is fired
        speakText.error = e=> {
            console.error('Error occurred...');
        };
        // Checking which voices has been chosen from the selection
        // and setting the voice to the chosen voice
        voices.forEach(voice => {
            if(voice.name.indexOf("English")>-1){	
                ///// take out bring back later, 
                //console.log("speaking voice is ",voice.name)
                speakText.voice = voice
            }
        });
        // Setting the rate and pitch of the voice
        speakText.rate = 1
        speakText.pitch = 1
        // Finally calling the speech function that enables speech
        synth.speak(speakText)
    },//end func speak	
    //=======================END VOICE SYNTHESIS==========
    //===================== MESSENGER=================
    alertMsg:(msg,type,xmodal)=>{
        //where? login or signup modal?
        const alertPlaceholder = document.getElementById(xmodal)
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${msg}</div>`,
        '</div>'
        ].join('')
        //new osndp
        alertPlaceholder.innerHTML=""
        alertPlaceholder.append(wrapper)
    },//=======alert msg
    /*
    Toast: (msg,nTimeOut)=> {
        // Get the snackbar DIV
        var x = document.getElementById("snackbar");
        x.innerHTML=msg
        // Add the "show" class to DIV
        x.className = "show";
        // After 3 seconds, remove the show class from DIV
        setTimeout(function(){ 
            x.className = x.className.replace("show", "hid"); 
        }, nTimeOut);
    },
    //===============END MESSENGER ===================
    */
    //==============FORM FUNCS ===========
    clearBox:function(){
        let reset_input_values = document.querySelectorAll("input[type=text]") 
        for (var i = 0; i < reset_input_values.length; i++) { //minus 1 dont include submit bttn
            reset_input_values[i].value = ''
        }
    },
    //remove all form class
    resetFormClass:(frm)=>{
        const forms = document.querySelectorAll(frm)
        const form = forms[0]
        Array.from(form.elements).forEach((input) => {
            input.classList.remove('was-validated')
            input.classList.remove('is-valid')
            input.classList.remove('is-invalid')
        })
    },
    //======post check / dep slip      
    imagePost: async(url)=>{
        console.log('*** FIRING IMAGEPOST() ****')
        //upload pic of tagged euqipment
        const myInput = document.getElementsByName('uploaded_file')[0]
        //console.log('myinput', myInput.files[0])
        const formData = new FormData();
        formData.append('file', myInput.files[0]);     
        myInput.files[0].name ='EOEXPERIMENT.pdf'
        console.log('imagePost() myinput', myInput.files[0])
        ////console.log(formData)
        // Later, perhaps in a form 'submit' handler or the input's 'change' handler:
        await fetch(url, {
        method: 'POST',
        body: formData,
        })
        .then( (response) => {
            return response.json() // if the response is a JSON object
        })
        .then( (data) =>{
            console.log('SUCCESS')
        })
        // Handle the success response object
        .catch( (error) => {
            console.log(error) // Handle the error response object
        });
    },
    //===tagging equipment for rent/sale
    equipmentTagPost: async (frm,modal,url="",xdata={}) =>{
        console.log(xdata)
        fetch(url,{
            method:'PUT',
            //cache:'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(xdata)
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            console.log('=======speaking now====', data)
            util.speak(data.voice)        
            util.hideModal('equipmentTagModal',2000)    
            //send message to super users
            const sendmsg = {
                msg: data.approve_voice,
                type: data.transaction     
            }
            //remind super users
            osndp.socket.emit('admin', JSON.stringify(sendmsg))
            osndp.filterBy() //reload admin.getall()
            //location.href='/admin'
        })
        .catch((error) => {
        // util.Toast(`Error:, ${error}`,1000)
            //console.error('Error:', error)
        })
    },
    //===== for signup posting
    signupPost:async function(frm,modal,url="",xdata={}){
        let continue_email = true
        fetch(url,{
            method:'POST',
            //cache:'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(xdata)
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            //
            if(data.status){
                continue_email=true
            //util.speak( data.message )
                util.alertMsg(data.message,'success','signupPlaceHolder')
                util.alertMsg("Mailing "+util.UCase(xdata.full_name),'info','signupPlaceHolder')
            }else{
            //util.speak(data.message)
                continue_email=false
                util.alertMsg(data.message,'warning','signupPlaceHolder')
                return false
            }//eif
        })
        .finally(() => {
            if(continue_email){
            //util.speak('Emailed Successfully!')
                util.signupMailer(`/signupmailer/${util.UCase(xdata.full_name)}/${xdata.email}/${encodeURIComponent(window.location.origin)}`)
            }//eif
        })
        .catch((error) => {
        // util.Toast(`Error:, ${error.message}`,1000)
        console.error('Error:', error)
        })
    },
    //===passwordcheck
    passwordCheck:(pwd,pAlert)=>{
        requirements.forEach((element) => element.classList.add("wrong")) 
        //on focus show alter
        pwd.addEventListener('focus',(e)=>{
            pAlert.classList.remove("d-none") 
            if (!pwd.classList.contains("is-valid")) {
                pwd.classList.add("is-invalid") 
            }
            console.log('util focus')
        },false)
        //if blur, hide alert
        pwd.addEventListener("blur", () => {
            pAlert.classList.add("d-none") 
        },false) 
        //as the user types.. pls check 
        pwd.addEventListener('input',(e)=>{
            if(nupwd.value!==""){
                if(nupwd.value!==pwd.value){
                    nupwd.classList.remove("is-valid")
                    nupwd.classList.add("is-invalid")
                }
            }
            util.pwdChecker(pwd,pAlert)
        },false)
    }, //end func
    pwdChecker:(password,passwordAlert)=>{
        //check length first
        let value = password.value 
        if (value.length < 6) {
            lenBool = false 
        } else if (value.length > 5) {
            lenBool = true 
        }
        if (value.toLowerCase() == value) {
            bigLetterBoolean = false 
        } else {
            bigLetterBoolean = true 
        }
        numBoolean = false 
        for (let i = 0;  i < value.length ; i++) {
            for (let j = 0;  j < numbers.length ; j++) {
                if (value[i] == numbers[j]) {
                    numBoolean = true 
                }
            }
        }
        specialCharBoolean = false 
        for (let i = 0 ; i < value.length;  i++) {
            for (let j = 0 ; j < specialChars.length ; j++) {
                if (value[i] == specialChars[j]) {
                    specialCharBoolean = true 
                }
            }
        }
        //conditions
        if (lenBool == true &&
            bigLetterBoolean == true && 
            numBoolean == true && 
            specialCharBoolean == true) {
            password.classList.remove("is-invalid") 
            password.classList.add("is-valid") 
            requirements.forEach((element) => {
                element.classList.remove("wrong") 
                element.classList.add("good") 
            }) 
            passwordAlert.classList.remove("alert-warning") 
            passwordAlert.classList.add("alert-success") 
        } else {
            password.classList.remove("is-valid") 
            password.classList.add("is-invalid") 
            passwordAlert.classList.add("alert-warning") 
            passwordAlert.classList.remove("alert-success") 
            if (lenBool == false) {
                leng.classList.add("wrong") 
                leng.classList.remove("good") 
            } else {
                leng.classList.add("good") 
                leng.classList.remove("wrong") 
            }
            if (bigLetterBoolean == false) {
                bigLetter.classList.add("wrong") 
                bigLetter.classList.remove("good") 
            } else {
                bigLetter.classList.add("good") 
                bigLetter.classList.remove("wrong") 
            }
            if (numBoolean == false) {
                num.classList.add("wrong") 
                num.classList.remove("good") 
            } else {
                num.classList.add("good") 
                num.classList.remove("wrong") 
            }
            if (specialCharBoolean == false) {
                specialChar.classList.add("wrong") 
                specialChar.classList.remove("good") 
            } else {
                specialChar.classList.add("good") 
                specialChar.classList.remove("wrong") 
            }                        
        }//eif lengbool
    },///======end func checker
    //==========field 2 password validator
    passwordFinal:(pwd)=>{
        //on focus show alter
        pwd.addEventListener('focus',(e)=>{
            if (!pwd.classList.contains("is-valid")) {
                pwd.classList.add("is-invalid") 
            }
        },false)
        //if blur, hide alert
        pwd.addEventListener("blur", () => {
            console.log('p2 blur')
        },false) 
        pwd.addEventListener("input", () => {
            if(pwd.value == oldpwd.value){
                pwd.classList.remove("is-invalid") 
                pwd.classList.add("is-valid") 
            }else{
                if(pwd.classList.contains("is-valid")){
                    pwd.classList.remove("is-valid") 
                    pwd.classList.add("is-invalid") 
                }
            }
        },false) 
    },///// ========end password field 2 checker
    //===============END FORMS ==========//
    //====================UTILITIES ==============
    UCase:function(element){
        return element.toUpperCase()
    },
       //check first if logged
    checklogin:()=>{
        let tebingUser = db.getItem("tebinglane-user")
        return JSON.parse(tebingUser)
    },
    setCookie : (c_name,value,exdays) => {
        //console.log('bagong setcookie');
        var exdate=new Date();
        exdate.setDate(exdate.getDate());
        var c_value = value +  "; expires="+exdate.toISOString()+ "; path=/";
        console.log( c_name + "=" + c_value	)
        document.cookie=c_name + "=" + c_value;	
    },//eo setcookie
    getCookie : (c_name) => {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++){
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="))
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==c_name)
            {
            return unescape(y);
            }
        }
    },
    //==========================END UTILITIES =======================
    //====================== CREATE DATE/SERIAL CODE==========================
    getDate:()=>{
        var today = new Date() 
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()
        today = mm + '-' + dd + '-' + yyyy
        return today
    },
    formatDate2:(xdate)=>{
        today = new Date(xdate)
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()
        today = mm+'/'+dd+'/'+yyyy
        return today
    },
    formatDate:()=>{
        var today = new Date() 
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()
        today = yyyy+ '-' + mm + '-' + dd
        return today
    },
    addCommas: (nStr)=> {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },
    Codes:()=>{
        var today = new Date() 
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()
        var hh = String( today.getHours()).padStart(2,'0')
        var mmm = String( today.getMinutes()).padStart(2,'0')
        var ss = String( today.getSeconds()).padStart(2,'0')
        today = "EO"+yyyy+mm+dd+hh+mmm+ss
        return today
    },
    //esp getting values for SELECT DROPDOWNS
    //====THIS WILL FIRE WHEN CREATING NEWSITE====//
    getAllMall:(url)=>{
        fetch(url)
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            console.log( 'All Main Malls ',data )
            cSelect = document.getElementById('mall_type')
            osndp.removeOptions( cSelect)
            console.log('line 590 util.js osndp.removeOptions()')
            let option = document.createElement("option")
            option.setAttribute('value', "")
            option.setAttribute('selected','selected')
            let optionText = document.createTextNode( "-- Pls Select --" )
            option.appendChild(optionText)
            cSelect.appendChild(option)
            for (let key in data.result) {
                let option = document.createElement("option")
                option.setAttribute('value', data.result[key].unique_id)
                let optionText = document.createTextNode( data.result[key].mall_name )
                option.appendChild(optionText)
                cSelect.appendChild(option)
            }
            cSelect.focus()
        })
        .catch((error) => {
            //util.Toast(`Error:, ${error}`,1000)
            console.error('Error:', error)
        })
    },
    //====================== END CREATE DATE/SERIAL CODE==========================
    //=======================MODALS ====================
    loadModals:(eModal, eModalFrm, eHashModalFrm, eModalPlaceHolder)=>{
        console.log('**** loadModals()***', eModal)
        //off keyboard cofig
        const configObj = { keyboard: false, backdrop:'static' }
        // get event
        //login event
        if(eModal == "loginModal"){
            xloginmodal =  new bootstrap.Modal(document.getElementById(eModal),configObj);
            let loginModalEl = document.getElementById(eModal)
            loginModalEl.addEventListener('hide.bs.modal', function (event) {
                //clear form
                let xform = document.getElementById(eModalFrm)
                xform.reset()
                util.resetFormClass(eHashModalFrm)
                //take away alert
                let cDiv = document.getElementById(eModalPlaceHolder)
                cDiv.innerHTML=""
                // do something...
                //console.log('LOGIN FORM EVENT -> ha?')
            },false)
        } //eif loginmodal
        //========for adding new site modal 
        if(eModal == "newsiteModal"){
            xnewsitemodal =  new bootstrap.Modal(document.getElementById(eModal),configObj);
        }//eif equipmentmodal
        //equipment tag modal
        if(eModal == "equipmentTagModal"){
            //console.log('loadModals(equpmentTagModal)')
            xequipmenttagmodal =  new bootstrap.Modal(document.getElementById(eModal),configObj);
            //equipment 
            let equipmentTagModalEl = document.getElementById(eModal)
            equipmentTagModalEl.addEventListener('show.bs.modal', function (event) {
            console.log('uyyy showing ')
            },false)
            equipmentTagModalEl.addEventListener('hide.bs.modal', function (event) {
                //clear form
                let xform = document.getElementById(eModalFrm)
                xform.reset()
                util.resetFormClass(eHashModalFrm)
                //take away alert
                const cDiv = document.getElementById('equipmentTagPlaceHolder')
                cDiv.innerHTML=""
                //after posting bring back btn
                const itagsave = document.getElementById('i-tag-save')
                const btntagsave = document.getElementById('tag-save-btn')
                btntagsave.disabled = false
                itagsave.classList.remove('fa-spin')
                itagsave.classList.remove('fa-refresh')
                itagsave.classList.add('fa-floppy-o')
            //// takeout muna  admin.fetchBadgeData()
            },false)       
        }//eif equipmentTagModal
        //================login,equipment andsignup  listener
        let aForms = [eHashModalFrm] 
        let aFormx
        // console.log(input.classList)
        if(eModal=="signupModal"){
            let passwordAlert = document.getElementById("password-alert");
        }
        //loop all forms
        aForms.forEach( (element) => {
            aFormx = document.querySelectorAll(element)
            //console.log(aFormx[0])
            if(aFormx){
                let aFormz = aFormx[0]
                //console.log(aFormz.innerHTML)
                Array.from(aFormz.elements).forEach((input) => {
                    if(!input.classList.contains('p1') &&
                        !input.classList.contains('p2')){//process only non-password field
                            input.addEventListener('keyup',(e)=>{
                                if(input.checkValidity()===false){
                                    input.classList.remove('is-valid')
                                    input.classList.add('is-invalid')
                                    e.preventDefault()
                                    e.stopPropagation()
                                } else {
                                    input.classList.remove('is-invalid')
                                    input.classList.add('is-valid')
                                } //eif
                            },false)
                            input.addEventListener('blur',(e)=>{
                                if(input.checkValidity()===false){
                                    input.classList.remove('is-valid')
                                    input.classList.add('is-invalid')
                                    e.preventDefault()
                                    e.stopPropagation()
                                } else {
                                    input.classList.remove('is-invalid')
                                    input.classList.add('is-valid')
                                } //eif
                            },false)
                    }else{ //=== if input contains pssword field
                        if(input.classList.contains('p1')){
                            if(eModal=="signupModal"){
                                util.passwordCheck(input,passwordAlert)        
                            }
                        }else{
                            util.passwordFinal(input)
                        }
                    }//else password field
                }) //end all get input
            }
        })///=====end loop form to get elements
    },
    //hide modal box
    hideModal:(cModal,nTimeOut)=>{
        setTimeout(function(){ 
            const xmodal =  bootstrap.Modal(document.getElementById(cModal));
            // const myModalEl = document.getElementById(cModal)
            // let xmodal = bootstrap.Modal.getInstance(myModalEl)
            xmodal.modal('hide')
            xmodal.hide()
        }, nTimeOut)
    },

    toModalShow:(modaltoshow,modalname,modalid,btnid)=>{

        doc = modalname
        doc_id =modalid
        btn_id = btnid

        util.modalShow(modaltoshow)
       
        console.log(doc, doc_id)
    },


    modalshowSave:(modaltoshow,docname,docid,xselect)=>{
        let aSelect = document.getElementById(xselect).value
        const aarr = aSelect.split(",")

        console.log( aarr )

        document.getElementById('book_month').value=aarr[0]
        document.getElementById('book_day').value=aarr[1]
        
        document.getElementById('fbookdate').value=String(aarr[0]).padStart(2, '0')+"/"+ String(aarr[1]).padStart(2,'0')+"/2024"
        document.getElementById('fbookhour').value = aarr[2]

        util.modalShow('examplemodal')

    },

    //show modal box
    //pls add to mobile
    modalShow:(modalToShow)=>{

        console.log('====util.modalShow() Loading... ======', modalToShow)
        
        //off keyboard cofig
        const configObj = { keyboard: false, backdrop:'static' }
        switch( modalToShow ){
            case "changeschedmodal":
                const changeschedmodal =  new bootstrap.Modal(document.getElementById(modalToShow), configObj);
                changeschedmodal.show()
            break
            
            case "videomodal":
                const videomodal =  new bootstrap.Modal(document.getElementById(modalToShow), configObj);
                videomodal.show()
            break

            case "gcashmodal":
                const gcashmodal =  new bootstrap.Modal(document.getElementById(modalToShow), configObj);
                gcashmodal.show()
            break

            case "calendarmodal":
                const calendarmodalEl = document.querySelector('.calendar-modal')
                //============== when new site modal loads, get project serial number
               
                zonked.getdoctorSched(doc_id,doc) //show calendar sched
            
                const calendarmodal =  new bootstrap.Modal(document.getElementById(modalToShow), configObj);
                calendarmodal.show()
            break

            case "examplemodal":
                $('#calendarmodal').modal('hide')

                const examplemodal =  new bootstrap.Modal(document.getElementById(modalToShow), configObj);
                examplemodal.show()
                //loadvalidate form
                util.loadFormValidation('#bookingForm')
                console.log( util.generateRandomDigits(5))
                //get initial data
                document.getElementById('fcase').value = util.generateRandomDigits(5)
                document.getElementById('fuserid').value = util.getCookie('f_userid')
                
                document.getElementById('fname').value = util.getCookie('fname')
                document.getElementById('femail').value = util.getCookie('f_email')
                document.getElementById('fdoctor').value = doc
                document.getElementById('fdoctor_id').value = doc_id
            break

            case "loginmodal":
                xloginmodal.show()    
            break
        }//switch end
    },

    //========MODAL LISTENERS========//
    modalListeners:(eModal)=>{
        switch (eModal){
            case "newsiteModal":
                //for upload pdf
                const frmupload = document.getElementById('uploadForm')
                frmupload.addEventListener("submit", e => {
                    const formx = e.target;
                    fetch('https://osndp.onrender.com/uploadpdf', {
                        method: 'POST',
                        body: new FormData(formx),
                        })
                        .then( (response) => {
                            return response.json() // if the response is a JSON object
                        })
                        .then( (data) =>{
                            if(data.status){
                                console.log ('uploadpdf() value=> ', data )
                                console.log('*****TAPOS NA PO IMAGE POST*****')
                                //util.hideModal('newsiteModal',2000)//then close form    
                                document.getElementById('newsitePlaceHolder').innerHTML=""
                            }
                        })
                        // Handle the success response object
                        .catch( (error) => {
                            console.log(error) // Handle the error response object
                        });
                    //e.preventDefault()
                    console.log('===ADMIN ATTACHMENT pdf FORM SUBMITTTTT===')
                        //// keep this reference for event listener and getting value
                        /////const eqptdesc = document.getElementById('eqpt_description')
                        ////eqptdesc.value =  e.target.value
                    // Prevent the default form submit
                    e.preventDefault();    
                })
                //=================END FORM SUBMIT==========================//
                const newsiteModalEl = document.getElementById(eModal)
                //============== when new site modal loads, get project serial number
                newsiteModalEl.addEventListener('show.bs.modal', function (event) {
                    //======get util.Codes()
                    document.getElementById('serial').value= util.Codes() 
                    document.getElementById('serial_pdf').value= document.getElementById('serial').value 
                    //===turn off upload-btn
                    const btnsave = document.getElementById('mall-save-btn')
                    btnsave.disabled = true
                    //==== create cookie to retrieve in api
                    util.setCookie("serial_pdf",document.getElementById('serial').value+".pdf" ,1)
                    //=====get   Malls()
                    console.log('newsiteModal() listeners loaded')
                    //===populate dropdown for malls
                    util.getAllMall(`https://osndp.onrender.com/getallmall`)
                    //==== load engineering
                    osndp.populate(document.getElementById('proj_engr'),'engineer')
                    //==== load archi
                    osndp.populate(document.getElementById('proj_design'),'design')
                },false)
                newsiteModalEl.addEventListener('hide.bs.modal', function (event) {
                    osndp.removeOptions(document.getElementById('proj_engr'))
                    osndp.removeOptions(document.getElementById('proj_design'))
                    document.getElementById('newsitePlaceHolder').innerHTML=""
                    //clear form
                    let xform = document.getElementById('newsiteForm')
                    xform.reset()
                    util.resetFormClass('#newsiteForm')
                    let uform = document.getElementById('uploadForm')
                    uform.reset()
                    util.resetFormClass('#uploadForm')
                    //after posting bring back btn
                    const isave = document.getElementById('i-save')
                    const btnsave = document.getElementById('mall-save-btn')
                    btnsave.disabled = false
                    isave.classList.remove('fa-spin')
                    isave.classList.remove('fa-refresh')
                    isave.classList.add('fa-floppy-o')
                    ////// take out muna admin.fetchBadgeData()
                    osndp.getAll(1,document.getElementById('filter_type').value) //first time load speak
                    // do something...
                    //console.log('LOGIN FORM EVENT -> ha?')
                },false)           
            break
            case "commentsModal":
                const commentsModalEl = document.getElementById('commentsModal')
                commentsModalEl.addEventListener('hide.bs.modal', function (event) {
                    //clear form
                    let xform = document.getElementById('commentsForm')
                    xform.reset()
                    util.resetFormClass('#commentsForm')
                })
            break
        }//end sw
    }, //end modallisteners func =========
    //======================END MODALS====================
    //===========STRIPE PAY ===========
    paymentInsert:()=>{
        const iframer = document.getElementById( "payframe" )
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            '<iframe width="100%" height="100%" border=0 class="embed-responsive-item" src="checkout2.html"></iframe>'
        ].join('')
        iframer.append(wrapper)
    },
    //==============randomizer ========//
    generateRandomDigits: (n) => {
        return Math.floor(Math.random() * (9 * (Math.pow(10, n)))) + (Math.pow(10, n));
    },
    //===================MAILER==================
    signupMailer:async (url="")=>{
        fetch(url)
        .then((response) => {  //promise... then 
            return response.json()
        })
        .then((data) => {
            util.alertMsg(data.message,'warning','signupPlaceHolder')
            util.hideModal('signupModal',2000)
        })
        .catch((error) => {
            //util.Toast(`Error:, ${error.message}`,3000)
            console.error('Error:', error)
        })    
    },

    //==========FOR ALL THE DATA ENTRY FORM LOAD THIS FIRST TO BE ABLE TO BE VALIDATED ===//
    loadFormValidation:(eHashFrm)=>{

        console.log('=== LOADINGFORM VALIDATION ====',eHashFrm)

        let aForms = [eHashFrm] 
        let aFormx
    
        //loop all forms
        aForms.forEach( (element) => {
            aFormx = document.querySelectorAll(element)
            //console.log(aFormx[0])
            if(aFormx){
                let aFormz = aFormx[0]
                //console.log(aFormz.innerHTML)
                Array.from(aFormz.elements).forEach((input) => {
                    if(!input.classList.contains('p1') &&
                        !input.classList.contains('p2')){//process only non-password field
                            input.addEventListener('keyup',(e)=>{
                                if(input.checkValidity()===false){
                                    input.classList.remove('is-valid')
                                    input.classList.add('is-invalid')
                                    e.preventDefault()
                                    e.stopPropagation()
                                } else {
                                    input.classList.remove('is-invalid')
                                    input.classList.add('is-valid')
                                } //eif
                            },false)
                            input.addEventListener('blur',(e)=>{
                                if(input.checkValidity()===false){
                                    input.classList.remove('is-valid')
                                    input.classList.add('is-invalid')
                                    e.preventDefault()
                                    e.stopPropagation()
                                } else {
                                    input.classList.remove('is-invalid')
                                    input.classList.add('is-valid')
                                } //eif
                            },false)
                    }else{ //=== if input contains pssword field
                        if(input.classList.contains('p1')){
                            if(eModal=="signupModal"){
                                util.passwordCheck(input,passwordAlert)        
                            }
                        }else{
                            util.passwordFinal(input)
                        }
                    }//else password field
                }) //end all get input
            }
        })///=====end loop form to get elements	
    },

    //==========WHEN SUBMIT BUTTON CLICKED ==================
    validateMe: async (frmModal, frm, classX)=>{

        console.log('validateMe()===', frmModal, frm)
        const forms = document.querySelectorAll(frm)
        const form = forms[0]
        let xmsg
        let aValid=[]
        Array.from(form.elements).forEach((input) => {
            if(input.classList.contains(classX)){
                aValid.push(input.checkValidity())
                if(input.checkValidity()===false){
                    console.log('invalid ',input)
                    input.classList.add('is-invalid')
                }else{
                    input.classList.add('is-valid')
                }
            }
        })
        if(aValid.includes(false)){
            console.log('====DON\'T POST PLS CHECK BLANK ITEMS,ERROS!!!...=====')
            return false
        }else{
            //getform data for posting
            const mydata = document.getElementById(frm.replace('#',''))
            let formdata = new FormData(mydata)

            let objfrm = {}
            //// objfrm.grp_id="1" <-- if u want additional key value
            for (var key of formdata.keys()) {
                if(key=="pw2"){
                    //console.log('dont add',key)
                }else{
                objfrm[key] = formdata.get(key);
                }
            }
            objfrm.date_reg = util.getDate()
            
            //=== POST NA!!!
            switch(frm){ 
                case '#registerform':
                    xmsg = "<div><i class='fa fa-spinner fa-pulse' ></i>  Saving to Database please wait...</div>"
                    util.alertMsg( xmsg,'danger','registerPlaceHolder')
                    util.registerPost(frm, frmModal,`https://osndp.onrender.com/registerpost`,objfrm)
                break

                case '#loginForm':
                    xmsg = "<div><i class='fa fa-spinner fa-pulse' ></i>  Searching Database please wait...</div>"
                    util.alertMsg( xmsg,'danger','loginPlaceHolder')

                    util.loginPost(frm ,frmModal,`${ipconfig}/asia/loginpost/${objfrm.uid}/${objfrm.pwd}/${objfrm.branch}`)
                    //util.loginPost(frm ,frmModal,`https://osndp.onrender.com/loginpost/${objfrm.uid}/${objfrm.pwd}`)
                break
            
                case "#bookingForm":
                    util.bookingPost( frm,frmModal,`https://osndp.onrender.com/bookingpost`,objfrm)    
                break;

            }//end switch
        }
    },

    setGroupCookie:(xname,xgrp,xemail,xvoice,xpic,xuserid)=>{
        util.setCookie("fname",xname,0)
        util.setCookie("grp_id",xgrp,0)
        util.setCookie("f_email",xemail,0)
        util.setCookie("f_voice",xvoice,0)
        util.setCookie("f_pic",xpic,0)
        util.setCookie("f_userid",xuserid,0)
    },

    //==== for login posting
    loginPost:async function(frm,modal,url="") {
        fetch(url, {
            cache:'reload'
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            console.log('data ko ', data )
            //alert(`here data ${JSON.stringify(data)}`)
            //close ModalBox
            if(data.found){
               
                ///util.speak(data.voice)
                util.alertMsg(`YOU ARE LOGGED IN ${data.fname}!`,'success','loginPlaceHolder')
                
                Toastify({
                    text: data.message,
                    duration:3000,
                    close:false,
                    position:'center',
                    offset:{
                        x: 0,
                        y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                    },
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast();
               
                zonked.speaks(data.voice)
                ///util.speak( data.voice )//take out later

                const logData = {
                    email: data.email,
                    full_name: data.fname,
                    grp_id: data.grp_id,
                    voice : data.voice,
                    pic:    data.pic,
                    user_id:data.id

                }

                let authz = []
                authz.push(logData.grp_id )
                authz.push(logData.full_name)
                            
                //==HANDSHAKE FIRST WITH SOCKET.IO
                const userName = { token : authz[1] , branch: document.getElementById("branch").value, mode: 1}//full name token

                zonked.socket = io.connect(`${ipconfig}`, {
                //zonked.socket = io.connect("https://osndp.onrender.com", {
                    //withCredentials: true,
                    query:`userName=${JSON.stringify(userName)}`
                    // extraHeaders: {
                    //   "osndp-header": "osndp"
                    // }
                });//========================initiate socket handshake ================
                
                //============START SOCKET.IO LISTNERS AFTER LOGIN=============/
                //===if patient dialled doctor and the socket found doc's device, this will be fired===/
                zonked.socket.on('answered',(data)=>{
                    
                    zonked.doctor_found ++
                    let xdata = JSON.parse(data)

                    console.log( "===doc found====",zonked.doctor_found,xdata)

                    if(zonked.doctor_found > 1){
                        
                        Toastify({
                            text: `Patient ${xdata.patient} is Trying to Reach You, Please respond by accepting the Call.`,
                            duration:3000,
                            close:false,
                            position:'center',
                            offset:{
                                x: 0,
                                y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                            },
                            style: {
                                background: "linear-gradient(to right, #00b09b, #96c93d)",
                            }
                        }).showToast();
                                
                        return false
                    }else{
                        const butt1 = `WOULD YOU LIKE TO ACCEPT THE CALL FROM ${xdata.patient}?<br /><button type='button' id='confirmationButtonYes' class='btn btn-primary'>Accept</button>&nbsp;<button type='button' id='confirmationButtonNo' class='btn btn-primary'>Decline</button>`
                        
                        Toastify({
                            text: butt1,
                            duration:0,
                            close:false,
                            position:'center',
                            offset:{
                                x: 0,
                                y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                            },
                            escapeMarkup:false, //to create html
                            style: {
                              
                              background: "linear-gradient(to right, #00b09b, #96c93d)",
                            }
                        }).showToast();

                        $('#confirmationButtonYes').on('click', function () {
                            zonked.doctor_found = 0
                            zonked.socket.emit('confirm', JSON.stringify(xdata))    
                            
                            var xxx = document.querySelector('.toastify')
                            xxx.classList.add('hide-me')

                        });
    
                        $('#confirmationButtonNo').on('click', function () {
                            zonked.doctor_found = 0
                            zonked.socket.emit('decline', JSON.stringify(xdata))
                            
                            var xxx = document.querySelector('.toastify')
                            xxx.classList.add('hide-me')

                        });
                    }//eid 
                })//=========================end socket on answered ====================================
                
                //confirmd video
                zonked.socket.on('confirmed',(data)=>{

                        //reset trigger
                        zonked.doctor_found=0

                        //alert(data)
                        let xdata =JSON.parse(data)
                        let xpeerId, xcallId
                        
                        //const opt =  'location=no,footer=yes,footercolor=#CC000000,closebuttoncaption=DONE,closebuttoncolor=#00FFFF'
                        const opts ='location=no,toolbar=yes,scrollbars=yes,resizable=yes,fullscreen=yes'
            
                        let loc, grp
        
                        if(xdata.type==="doctor"){
                            xpeerId = xdata.doctor+'-'+ xdata.caseno
                            xcallId =  xdata.patient+'-'+ xdata.caseno
                            grp = 2
                            
                        }else{
                            xpeerId = xdata.doctor+'-'+ xdata.caseno
                            xcallId =  xdata.patient+'-'+ xdata.caseno
                            grp = 1
                            
                        }  

                        //pls add to mobile
                        loc = `https://vantaztic.com/vanz/p2p.html?peer=${xpeerId}&case=${xdata.caseno}&patient=${xcallId}&id=${grp}&uid=${logData.user_id}`
                        //loc = `https://lemonchiffon-ram-814971.hostingersite.com/vid/p2p.html?peer=${xpeerId}&case=${xdata.caseno}&patient=${xcallId}&id=${grp}&uid=${logData.user_id}`
                        //loc = `http://localhost:4006/p2p.html?peer=${xpeerId}&case=${xdata.caseno}&patient=${xcallId}&id=${grp}&uid=${logData.user_id}`
                        
                        window.open(loc, "_blank",opts);

                    
                })//=======================end socket confirmed===============
                
                //===declined
                zonked.socket.on('declined',(data)=>{
                    //reset trigger
                    zonked.doctor_found = 0

                    let xdata =JSON.parse(data)
                   
                    Toastify({
                        text: `DR ${xdata.doctor} is BUSY at the moment and DECLINED, kindly wait for her availability and check again!...`,
                        duration:4000,
                        close:false,
                        position:'center',
                        offset:{
                            x: 0,
                            y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                        },
                        style: {
                          background: "linear-gradient(to right, #00b09b, #96c93d)",
                        }
                    }).showToast();

                    //return false
                })//======================end sock delcined=====================


                //==SEND BACK TO PATIENT WHO DIALLED DOCTOR
                //==AND RELAY MSG
                zonked.socket.on('noconnect',(data)=>{
                    let xdata = JSON.parse(data)
                    
                    Toastify({
                        text: `DR. ${xdata.doctor} is not connected...`,
                        close:false,
                        position:'center',
                        offset:{
                            x: 0,
                            y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                        },
                        style: {
                          background: "linear-gradient(to right, #00b09b, #96c93d)",
                        }
                    }).showToast();
                })//=======================end socket no connect ====================

                //console.log('***logdata***', logData)
                util.setGroupCookie(data.fname, data.grp_id, data.email, data.voice, data.pic, data.id)/*=== SET GROUP COOKIE */
                //document.querySelector('#user-name').innerHTML = authz[1]
                //check grp_id
                //if admin add menu
                //console.log( logData.grp_id)
                //const iab = cordova.InAppBrowser;
                
                switch ( logData.grp_id){
                    case "1":
                        zonked.insertSection()
                        util.scrollsTo('current_projects')   
                        zonked.insertDelivery()

                    break

                    case "3"://SIR BENNEY
                        util.user_id = logData.user_id
                        zonked.cronJob()
                    break
                    default:
                    break
                }
                
                util.addmenu( logData.grp_id )
            
            }else{
                ///util.speak(data.voice)
                util.alertMsg(data.message,'warning','loginPlaceHolder')
                ///alert(data.message)
                console.log('notfound',data.message)
                return false
            }
        })
        .catch((error) => {
            ///util.Toast(`Error:, ${error}`,1000)
            console.error('Error:', error)
        })

        return true
    },

    //====ADD MENU GRPID AFTER LOGIN===pls add to mobile//
    addmenu:(grpid)=>{
        const menu = document.getElementById('menulist')

        menu.innerHTML = "" //erase contents
        //pls add to mobile
        let aOrigMenu = ["About Us","Contact Us","Log Out"]
        let aOrigMenuLink = ["#aboutus","#contacts","javascript:window.document.location.href='/'"]
        let origLImenu = ""
        
        for(let xkey in aOrigMenu){
            origLImenu += `
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="${aOrigMenuLink[xkey]}">
                        ${aOrigMenu[xkey]}
                </a>
            </li>`
        }//==END FOR
        
        switch (grpid){
            case "1":
                
            break
            
            case "3": //if grpid 3 admin people 
            /*()
                origLImenu += `
                <!--//PLS ADD TO MOBILE//-->
                <li class="nav-item dropdown">
                    <a class="nav-link link text-black dropdown-toggle display-4" href="#" data-toggle="dropdown-submenu">
                    Admin Tool
                    </a>
                    <div class="dropdown-menu" id='drops' >
                        <a style="background-color:#FF6666;a.color:white;" class="text-white dropdown-item display-4" href="javascript:zonked.getapprovalReg()">Approve Registration</a>
                       <a style="background-color:#FF6666;a.color:white;" class="text-white dropdown-item display-4" href="javascript:zonked.getreport()">Get Report</a>
                     
                    </div>
                </li>
                
                `//    */
            break
            //pls add to mobile
            case "2": //if grpid 2 doctors 
                origLImenu += `
                <li class="nav-item dropdown">
                    <a class="nav-link link text-black dropdown-toggle display-4" href="#" data-toggle="dropdown-submenu">
                    Tools
                    </a>
                    <div class="dropdown-menu" id='drops' >
                        <a style="background-color:red;a.color:white;" class="text-white dropdown-item display-4" href="javascript:zonked.getpatientBooking(1,${util.user_id},'')">View Booking</a>
                        <a style="background-color:red;a.color:white;" class="text-white dropdown-item display-4" href="javascript:zonked.changeschedule()">Change Schedule</a>
                    </div>
                </li>`
            break
        }
        
        menu.innerHTML= origLImenu
                
    },
    
    registerPost:async function(frm,modal,url="",xdata={}){
        fetch(url,{
            method:'POST',
            //cache:'no-cache',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(xdata)
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            if(data.status){

                util.scrollsTo('login')
                
                //util.speak(data.voice)
                zonked.speaks(data.voice)
                
                document.getElementById('registerPlaceHolder').innerHTML= ""

                let xform = document.getElementById('registerform')
                xform.reset()
                
                util.resetFormClass('#registerform')

            }else{
                zonked.speaks(data.voice)
                
                Toastify({
                    text: data.message,
                    duration:4000,
                    close:false,
                    position:'center',
                    offset:{
                        x: 0,
                        y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                    },
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast();
               
                // brig back online zonked.speaks(data.voice)
                //util.alertMsg(data.message,'warning','equipmentPlaceHolder')
                return false
            }//eif
        })
        .catch((error) => {
        // util.Toast(`Error:, ${error.message}`,1000)
        console.error('Error:', error)
        })

        return true
    },


    //new booking posting
    bookingPost:async function(frm,modal,url="",xdata={}){
        fetch(url,{
            method:'POST',
            //cache:'no-cache',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(xdata)
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            if(data.status){

                ///util.speak(data.voice)
                zonked.speaks(data.voice)

                document.getElementById('xclosebtn').click()//close modal 

                document.getElementById('site_info').innerHTML=""

                zonked.insertHistory()
                
                ///util.hideModal('examplemodal',2000)    
                ///// THIS IS IMPORTANT.. TAKE OUT MUNA 03/09/2024 admin.filterBy() ///getAll() // update tables and speak
                //util.Toast('PLS. WAIT, UPLOADING FILE!',20000)
            }else{
                util.speak(data.voice)
                //// bring back online zonked.speaks(data.voice)
                //util.alertMsg(data.message,'warning','equipmentPlaceHolder')
                return false
            }//eif
        })
        .catch((error) => {
        // util.Toast(`Error:, ${error.message}`,1000)
        console.error('Error:', error)
        })
        return true
    },

    
    //new site posting 
    newsitePost:async function(frm,modal,url="",xdata={}){
        fetch(url,{
            method:'POST',
            //cache:'no-cache',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(xdata)
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            if(data.status){
                //trigger pdf upload
                //===trigger upload pdf
                const uploadbtn = document.getElementById('upload-btn')
                uploadbtn.click()
                util.speak(data.voice);
                xmsg = "<div><i class='fa fa-spinner fa-pulse' ></i>  Uploading file please wait...</div>"
                util.alertMsg( xmsg,'danger','newsitePlaceHolder')
                ///document.getElementById('ip').innerHTML = 'Uploading file , please Wait!!!'
                    //send message to super users
                const sendmsg = {
                    msg: data.approve_voice,
                    type:""    
                }
                //remind super users
                osndp.socket.emit('admin', JSON.stringify(sendmsg))
                ////util.alertMsg(data.message,'success','equipmentPlaceHolder')
                //hide modalbox
                util.hideModal('newsiteModal',2000)    
                ///// THIS IS IMPORTANT.. TAKE OUT MUNA 03/09/2024 admin.filterBy() ///getAll() // update tables and speak
                //util.Toast('PLS. WAIT, UPLOADING FILE!',20000)
            }else{
                util.speak(data.voice)
                util.alertMsg(data.message,'warning','equipmentPlaceHolder')
                return false
            }//eif
        })
        .catch((error) => {
        // util.Toast(`Error:, ${error.message}`,1000)
        console.error('Error:', error)
        })
    },
//=================END MAILER ==================
}//****** end obj */