<template>
  <div>
    <b-modal id="connectError" size="xl" hide-footer title="Error">
      <b-alert show variant="danger">
        <h2>Cannot connect to backend</h2>
        <hr/>
        <p><span v-html="connectionError"></span></p>
      </b-alert>
      <b-img :src="image" fluid-grow alt="Fluid-grow image"></b-img>
    </b-modal>
    <b-modal id="newMonth" ref="newMonth" size="xl" hide-footer title="Warning">
      <b-form-select id="month" v-model="month" size="lg" class="w-40 my-3" :options="months" required/>
      <b-form-input id="year" v-model="year" size="lg" class="w-30 my-3" required />
      <p>
        <h3>Are you sure you want to add a new month's balance for the month of {{month}} to all active clients?</h3>
      </p>
      <b-button size="lg"
        v-if="nodeType == 'primary'"
        @click="addNewMonthBalance()"
        variant="warning">
        I am sure!
      </b-button>
      <b-button size="lg"
        @click="closeStartNewMonth()"
        v-if="nodeType == 'primary'">
        Close
      </b-button>
    </b-modal>
    <b-container>
      <b-navbar toggleable="lg" type="dark" variant="info">
        <b-form-input id="search-name" v-model="clientName" size="lg" class="w-50" required placeholder="Search..."/>
        <b-form-checkbox id="search-status" v-model="active" size="lg" class="px-5">Active?</b-form-checkbox>

        <b-button size="lg"
          v-if="nodeType == 'primary'"
          v-b-modal.newMonth
          variant="warning">
          Start a new month
        </b-button>
      </b-navbar>
      <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" size="lg"></b-pagination>
      <b-table striped hover 
        :items="clients" 
        :fields="fields"
        :current-page="currentPage"
        >
        <template slot="actions" slot-scope="row">
          <b-button
            size="lg"
            @click="editTransaction(row.item, row.index, $event.target)"
            :class="(row.item.currentBalance > 0)?  'btn-success':  'btn-failure'"
            :disabled="row.item.active == false">
            Transactions
          </b-button>
          <b-button size="lg" v-if="nodeType == 'primary'" @click="editClient(row.item, row.index, $event.target)" :class="(row.item.currentBalance > 0)?  'btn-success':  'btn-failure'">
            Client Setup
          </b-button>
        </template>
      </b-table>
    </b-container >
    <ClientEdit ref="clientEdit" modal-id="client-edit" ok-only @editClientClosed="refreshClients()"/>
    <TransactionEdit ref="transactionEdit" modal-id="transaction-edit" ok-only @editTransactionClosed="refreshClients()"/>
  </div>
</template>

<script>
  import axios from 'axios'
  import ClientEdit from './ClientEdit'
  import TransactionEdit from './TransactionEdit'
  import image from '../../assets/images/error.jpg'
  import moment from 'moment'
  // import Vuex from 'vuex'
  
  export default {
    name: 'clients-search',
    components: {
      ClientEdit,
      TransactionEdit
    },
    data: function () {
      return {
        clientName: '',
        active: true,
        clients: null,
        currentPage: 1,
        totalRows: 0,
        perPage: 10,
        connectionError: null,
        image: image,
        nodeType: 'slave',
        month: 'JAN',
        year: null,
        months: [
          {value: 'JAN', text: 'January'},
          {value: 'FEB', text: 'February'},
          {value: 'MAR', text: 'March'},
          {value: 'APR', text: 'April'},
          {value: 'MAY', text: 'May'},
          {value: 'JUN', text: 'June'},
          {value: 'JUL', text: 'July'},
          {value: 'AUG', text: 'August'},
          {value: 'SEP', text: 'September'},
          {value: 'OCT', text: 'October'},
          {value: 'NOV', text: 'November'},
          {value: 'DEC', text: 'December'}
        ],
        fields: [
          {
            key: 'id',
            thClass: 'd-none',
            tdClass: 'd-none'
          },
          {
            key: 'referenceNumber',
            label: 'Reference Number'
          },
          {
            key: 'name',
            label: 'Customer Name'
          },
          {
            key: 'currentBalance',
            label: 'Balance'
          },
          {
            key: 'lastPaid',
            label: 'Last Payment Date',
            formatter: value => {
              return moment(value).format('DD-MM-YYYY')
            }
          },
          {
            key: 'actions',
            label: 'Actions'
          }
        ]
      }
    },
    mounted () {
      this.refreshClients()
      this.setupSettingsButtons()
      this.month = this.months[moment().month()].value
      this.year = moment().year()
    },
    computed: {
    },
    methods: {
      editTransaction (item, index, button) {
        this.$root.$emit('bv::show::modal', 'transaction-edit', button)
        this.$refs.transactionEdit.refreshClient(item.id)
      },
      editClient (item, index, button) {
        this.$root.$emit('bv::show::modal', 'client-edit', button)
        this.$refs.clientEdit.refreshClient(item.id)
      },
      refreshClients () {
        axios.get('http://localhost:8080/clients/search/searchClients?' +
          'name=' + this.clientName +
          '&active=' + this.active +
          '&page=' + (this.currentPage - 1) +
          '&size=' + this.perPage).then(result => {
          this.clients = result.data._embedded.clients
          this.totalRows = result.data.page.totalElements
        }).catch((error) => {
          this.connectionError = error
          this.$bvModal.show('connectError')
          console.log(error)
        })
      },
      setupSettingsButtons () {
        axios.get('http://localhost:8080/settings?code=nodeType').then(result => {
          this.nodeType = result.data._embedded.settings[0].value
        }).catch((error) => {
          console.log(error)
        })
      },
      addNewMonthBalance () {
        axios.post('http://localhost:8080/client/addNewMonthBalance', {month: this.month, year: this.year}).then(result => {
          this.refreshClients()
          this.closeStartNewMonth()
        }).catch((error) => {
          console.log(error)
        })
      },
      closeStartNewMonth () {
        this.$refs['newMonth'].hide()
      }
    },
    watch: {
      currentPage: {
        handler: function (value) {
          this.refreshClients()
        }
      },
      clientName: {
        handler: function (value) {
          this.refreshClients()
        }
      },
      active: {
        handler: function (value) {
          this.refreshClients()
        }
      }
    }
  }
</script>

<style>
</style>
