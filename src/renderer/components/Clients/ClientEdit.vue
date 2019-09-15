<template>
  <div>
    <b-modal :id="modalId" ref="clientEdit" size="xl" hide-footer title="Transactions" @hide="emitClose()">
      <div class="d-block text-center">
        <h3>Client Setup</h3>
      </div>
      <b-container fluid>
        <b-row class="my-1">
          <b-col sm="12">
            <b-alert
              :show="dismissCountDown"
              dismissible
              block
              variant="danger"
              @dismissed="dismissCountDown=0"
              @dismiss-count-down="countDownChanged">
              <p>{{errorMessage}}</p>
            </b-alert>
          </b-col>
        </b-row>
        <b-row class="my-1">
          <b-col sm="12">
            <b-form-group
              id="referenceNumberLabel"
              label="Reference Number"
              label-for="referenceNumber"
              :invalid-feedback="referenceNumberInvalidFeedback"
              :state="$v.client.referenceNumber.$invalid ? !$v.client.referenceNumber.$invalid : null">
              <b-form-input 
                id="referenceNumber"
                size="lg"
                v-model.number="client.referenceNumber"
                type="number"
                maxLength="8"
                :state="$v.client.referenceNumber.$invalid ? !$v.client.referenceNumber.$invalid : null"
                ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="my-2">
          <b-col sm="12">
            <b-form-group
              id="nameLabel"
              label="Client Name"
              label-for="name"
              :invalid-feedback="nameInvalidFeedback"
              :state="$v.client.name.$invalid ? !$v.client.name.$invalid : null">
              <b-form-input id="name"
                size="lg"
                v-model.text="client.name"
                :state="$v.client.name.$invalid ? !$v.client.name.$invalid : null"
                ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col sm="12">
            <b-form-group
              id="currentBalanceLabel"
              label="Current Balance"
              label-for="currentBalance"
              :invalid-feedback="currentBalanceInvalidFeedback"
              :state="$v.client.currentBalance.$invalid? !$v.client.currentBalance.$invalid : null">

              <b-form-input
                id="currentBalance"
                size="lg"
                type="number"
                v-model.number="client.currentBalance"
                :state="$v.client.currentBalance.$invalid ? !$v.client.currentBalance.$invalid : null">
              </b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col sm="12">
            <b-form-group
              id="addressLabel"
              label="Address"
              label-for="address">
              <b-form-textarea id="address" rows="3" size="lg" v-model.number="client.address"></b-form-textarea>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col sm="12">
            <b-form-checkbox
              id="status"
              v-model="client.active"
              value="true"
              unchecked-value="false"
              size="lg"
              name="status">
              Active?
            </b-form-checkbox>
          </b-col>
        </b-row>
      </b-container>
      <div class="float-right">
        <b-button class="mt-3" size="lg" variant="success" @click="save()">Save</b-button>
        <b-button class="mt-3" size="lg" @click="close()">Close</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import axios from 'axios'
  import moment from 'moment'
  import { required, maxLength, minLength } from 'vuelidate/lib/validators'
  import { validationMixin } from 'vuelidate'

  export default {
    name: 'client-edit',
    components: {
    },
    mixins: [validationMixin],
    props: ['modalId'],
    data: function () {
      return {
        clientId: 0,
        client: {
          name: null,
          referenceNumber: null,
          currentBalance: 0.0,
          address: null,
          active: true
        },
        dismissCountDown: 0,
        dismissSecs: 6,
        errorMessage: null
      }
    },
    validations: {
      client: {
        referenceNumber: {
          required,
          maxLength: maxLength(8)
        },
        currentBalance: {
          required,
          maxLength: maxLength(12)
        },
        name: {
          required,
          maxLength: maxLength(256),
          minLength: minLength(1)
        }
      }
    },
    mounted () {
    },
    methods: {
      refreshClient (clientId) {
        if (!clientId) {
          return
        }
        this.clientId = clientId

        axios.get('http://localhost:8080/clients/' + clientId).then(result => {
          this.client = result.data
        }).catch(function (error) { console.log(error) })
      },
      clearAmountReceived () {
        this.amountReceived = 0
        this.onDate = moment(new Date()).format('YYYY-MM-DD')
      },
      save () {
        this.$v.$touch()
        if (this.$v.$anyError) {
          return
        }
        axios.put('http://localhost:8080/clients/' + this.clientId, this.client)
          .then(result => {
            this.refreshClient(this.clientId)
            this.close()
            this.emitClose()
          }).catch((error) => {
            this.showAlert()
            this.errorMessage = error.response.data
          })
      },
      close () {
        this.$refs['clientEdit'].hide()
      },
      emitClose () {
        this.$emit('editClientClosed', 'true')
      },
      countDownChanged (dismissCountDown) {
        this.dismissCountDown = dismissCountDown
      },
      showAlert () {
        this.dismissCountDown = this.dismissSecs
      }
    },
    computed: {
      referenceNumberInvalidFeedback () {
        if (!this.$v.client.referenceNumber.required) {
          return 'Value is required'
        } else if (!this.$v.client.referenceNumber.maxLength) {
          return 'The reference number can have a maximum of 8 digits'
        }
      },
      currentBalanceInvalidFeedback () {
        if (!this.$v.client.currentBalance.required) {
          return 'Value is required'
        }
      },
      nameInvalidFeedback () {
        if (!this.$v.client.name.required) {
          return 'Value is required'
        } else if (!this.$v.client.name.maxLength) {
          return 'The maximum length of the name is 256 characters'
        } else if (!this.$v.client.name.minLength) {
          return 'The name must contain at least 1 character'
        }
      }
    }
  }
</script>

<style>
  .actions {
    width: 10%
  }
</style>
