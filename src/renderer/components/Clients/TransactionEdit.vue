<template>
  <div>

    <b-modal :id="modalId" ref="transactionEdit" size="xl" hide-footer title="Transactions" @hide="emitClose()">
      <div class="d-block text-center">
        <h3>Client Details</h3>
      </div>
      <b-container fluid>
        <b-row class="my-1">
          <b-col sm="2">
            <label for="referenceNumber">Reference Number:</label>
          </b-col>
          <b-col sm="10">
            <b-form-input id="referenceNumber" size="lg" v-model.number="referenceNumber" readonly></b-form-input>
          </b-col>
        </b-row>
        <b-row class="my-2">
          <b-col sm="2">
            <label for="clientName">Client Name:</label>
          </b-col>
          <b-col sm="10">
            <b-form-input id="clientName" size="lg" v-model.text="clientName" readonly></b-form-input>
          </b-col>
        </b-row>
        <b-row class="my-2">
          <b-col sm="2">
            <label for="currentBalance">Balance:</label>
          </b-col>
          <b-col sm="10">
            <b-form-input id="currentBalance" size="lg" v-model.number="currentBalance" readonly></b-form-input>
          </b-col>
        </b-row>
        <b-row class="my-4">
          <b-col sm="2">
          </b-col>
          <b-col sm="10">
            <b-button size="lg" v-b-toggle.transaction-collapse variant="primary" @click="clearAmountReceived()" class="mr-1">Record Transaction</b-button>
            <b-collapse id="transaction-collapse" class="mt-2">
              <b-card>
                <p class="card-text">Record Transaction</p>
                <b-input-group class="mt-2">
                  <b-input-group-text for="ammountReceived" slot="prepend">Ammount Received:</b-input-group-text>
                  <b-form-input 
                    id="ammountReceived" 
                    size="lg" 
                    :model="amountReceived" 
                    v-model.number="$v.amountReceived.$model"
                    :state="$v.amountReceived.$dirty ? !$v.amountReceived.$error : null"
                    aria-describedby="ammountReceived-live-feedback"
                    ></b-form-input>
                    
                  <b-form-select id="month" v-model="month" size="lg" :options="months" required/>
                  <b-form-input id="year" v-model="year" size="lg" required />
                  <b-button v-b-toggle.collapse-1-inner variant="success" size="lg" slot="append" @click="save(false)" :disabled="$v.$invalid">Save</b-button>
                </b-input-group>
                <div v-if="$v.amountReceived.$error">
                  <large id="passwordHelp" class="text-danger">
                    The amount received is mandatory and must be greater than zero.
                  </large>      
                </div>
              </b-card>
            </b-collapse>
          </b-col>
        </b-row>
      </b-container>

      <div class="d-block text-center">
        <h3>Transactions</h3>
      </div>
      <div class="text-center">
        <b-card>
          <p class="card-text">Transactions Filter</p>
          <b-input-group class="mt-2">
            <b-form-select id="month" v-model="monthFilter" size="lg" :options="months" required @change="refreshTransactions()"/>
            <b-form-input id="year" v-model="yearFilter" size="lg" required  @change="refreshTransactions()"/>
            <span class="my-2">Total amount paid is {{this.totalAmountPaid}}</span>
          </b-input-group>
        </b-card>
      </div>

      <b-table striped hover 
        :items="transactions" 
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
        >
        <template slot="actions" slot-scope="row">
          <b-button v-if="!row.item.imported" size="lg" @click="deleteTransaction(row.item.id)" class="btn-danger">
            Delete
          </b-button>
        </template>
      </b-table>

      <b-button class="mt-3 w-50 float-right" size="lg" block @click="hideTransactionEdit()">Close</b-button>
    </b-modal>

    <b-modal ref="alreadyPaidWarning" size="xl" hide-footer title="Warning">
      <div class="d-block text-center">
        <h2>We've already received a payment from this client this month!</h2>
        <h3>Do you still want to record this payment?</h3>
      </div>
      <div class="d-block text-center">
        <b-button class="mt-3 w-25" size="lg" variant="outline-danger" @click="save(true)">Save Anyway</b-button>
        <b-button class="mt-3 w-25" size="lg" variant="outline-success" @click="hideWarning()">No</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import axios from 'axios'
  import moment from 'moment'
  import { required, minValue } from 'vuelidate/lib/validators'
  import { validationMixin } from 'vuelidate'

  export default {
    name: 'transaction-edit',
    components: {
    },
    mixins: [validationMixin],
    props: ['modalId'],
    data: function () {
      return {
        clientId: 0,
        clientName: 'test',
        referenceNumber: null,
        currentBalance: 0,
        amountReceived: 0,
        month: 'JAN',
        year: '2018',
        monthFilter: 'JAN',
        yearFilter: '2018',
        totalAmountPaid: 0,
        transactions: null,
        totalRows: 0,
        currentPage: 1,
        perPage: 10,
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
            key: 'dueMonth',
            label: 'Month',
            formatter: value => {
              let months = [
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
              ]
              return months.filter(month => month.value === value)[0].text
            }
          },
          {
            key: 'dueYear',
            label: 'Year'
          },
          {
            key: 'amountDue',
            label: 'Amount Due'
          },
          {
            key: 'amountPaid',
            label: 'Amount Paid'
          },
          {
            key: 'actions',
            label: 'Actions',
            tdClass: 'actions'
          }
        ]
      }
    },
    validations: {
      amountReceived: {
        required,
        minValue: minValue(1)
      }
    },
    mounted () {
      this.month = this.months[moment().month()].value
      this.monthFilter = this.month
      this.year = moment().year()
      this.yearFilter = this.year

      this.refreshTransactions(this.clientId)
    },
    methods: {
      refreshTransactions () {
        this.totalAmountPaid = 0
        axios.get('http://localhost:8080/transactions/search/findByClientIdAndDueMonthAndDueYear', {params: { clientId: this.clientId, dueMonth: this.monthFilter, dueYear: this.yearFilter }}).then(result => {
          this.totalRows = result.data._embedded.transactions.length
          this.transactions = result.data._embedded.transactions
        }).catch(function (error) { console.log(error) })
        axios.get('http://localhost:8080/payments/search/findByClientIdAndDueMonthAndDueYear', {params: { clientId: this.clientId, dueMonth: this.monthFilter, dueYear: this.yearFilter }}).then(result => {
          console.log(result)
          this.totalAmountPaid = result.data._embedded.payments[0].totalAmountPaid
        }).catch(function (error) {
          console.log(error)
        })
      },
      refreshClient (clientId) {
        if (!clientId) {
          return
        }
        this.clientId = clientId

        axios.get('http://localhost:8080/clients/' + clientId).then(result => {
          let client = result.data
          this.clientName = client.name
          this.referenceNumber = client.referenceNumber
          this.currentBalance = client.currentBalance
        }).catch(function (error) { console.log(error) })

        this.refreshTransactions()
      },
      clearAmountReceived () {
        this.amountReceived = 0
        this.onDate = moment(new Date()).format('YYYY-MM-DD')
      },
      save (force) {
        this.$v.$touch()
        if (this.$v.$anyError) {
          return
        }
        if (!force) {
          let isPaidThisMonth = this.transactions.some(function (element) {
            if (moment(element.onDate).isAfter(moment(new Date()).subtract(1, 'months'))) {
              return true
            }
          })

          if (isPaidThisMonth) {
            this.$refs['alreadyPaidWarning'].show()
            return
          }
        } else {
          this.$refs['alreadyPaidWarning'].hide()
        }
        axios.post('http://localhost:8080/transaction/pay', {clientId: this.clientId, dueMonth: this.month, dueYear: this.year, amountPaid: this.amountReceived}).then(result => {
          this.refreshClient(this.clientId)
        })
      },
      hideWarning () {
        this.$refs['alreadyPaidWarning'].hide()
      },
      hideTransactionEdit () {
        this.$refs['transactionEdit'].hide()
      },
      deleteTransaction (id) {
        axios.delete('http://localhost:8080/transaction/' + id).then(result => {
          this.refreshClient(this.clientId)
        })
      },
      emitClose () {
        this.$emit('editTransactionClosed', 'true')
      }
    }
  }
</script>

<style>
  .actions {
    width: 10%
  }
</style>
