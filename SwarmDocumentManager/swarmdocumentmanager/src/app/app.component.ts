import {Component, HostListener, NgZone} from '@angular/core';
import {canBeNumber} from '../util/validation';

const Web3 = require('web3');
const Bzz = require('web3-bzz');
const contract = require('truffle-contract');
const documentManagement = require('../../build/contracts/DocumentManagement.json');

declare var window: any;
declare var buffer: any;

interface DocumentEntry {
  hash: string;
  description: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  DocumentManagement = contract(documentManagement);

  // TODO add proper types these variables
  account: any;
  accounts: any;
  web3: any;
  bzz: any;
  hash: string;

  documents: DocumentEntry[] = [];

  balance: number;
  sendingFile: File;
  fileDescription: string;
  status: string;
  canBeNumber = canBeNumber;

  constructor(private _ngZone: NgZone) {

  }

  @HostListener('window:load')
  windowLoaded() {
    this.checkAndInstantiateWeb3();
    this.onReady();
  }

  checkAndInstantiateWeb3 = () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(
        'No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
      );
    }
  };

  onReady = () => {
    // Bootstrap the DocumentManagement  abstraction for Use.
    this.DocumentManagement.setProvider(this.web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert(
          'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
        );
        return;
      }
      this.accounts = accs;
      this.account = this.accounts[0];

      this.bzz = new Bzz('http://localhost:8500');


      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() =>
        this.refreshDocuments()
      );
    });
  };
  transformDocuments = (length) => {
    if (length === 0) {
      return;
    }
    this.DocumentManagement
      .deployed()
      .then(instance => {
        for (let i = 0; i < length; i++) {
          instance.getDocument.call(i, {from: this.account}).then(val => {
            console.log(val);
            this.documents.push({
              hash: val[0],
              description: val[1]
            });
          });
        }
      });
  };

  refreshDocuments = () => {
    let dm;
    this.DocumentManagement
      .deployed()
      .then(instance => {
        dm = instance;
        return dm.getDocumentsLength.call({from: this.account}).then((value) => {
          this.documents = [];
          this.transformDocuments(value.toNumber());
        });
      })
      .catch(e => {
        console.log(e);
        this.setStatus('Error getting documents; see log.');
      });
  };

  setStatus = message => {
    this.status = message;
  };

  sendFile = () => {
    let dm;

    this.setStatus('Initiating transaction... (please wait)');

    this.DocumentManagement.deployed().then(instance => {
      dm = instance;
      console.log(instance);
      const reader = new FileReader();
      reader.onloadend = () => {
        const buf = buffer.Buffer(reader.result) // Convert data into buffer
        this.bzz.upload(buf).then((data) => {
          return dm.addDocument(data, this.fileDescription, {from: this.account});
        }).then((result) => {
          this.refreshDocuments();
          this.setStatus('Transaction completed.');
        });
      }

      reader.readAsArrayBuffer(this.sendingFile); // Read Provided File
    });

  }
  ;

  onChange(event: EventTarget) {
    const eventObj: MSInputMethodContext = <MSInputMethodContext> event;
    const target: HTMLInputElement = <HTMLInputElement> eventObj.target;
    const files: FileList = target.files;
    this.sendingFile = files[0];

  }


}
