<template lang="html">
  <section class="container login">
    <Nav-Authentication></Nav-Authentication>
    <div class="container auth">
      <div class="row justify-content-center">

        <h2 v-if="attemptLogin" class="loading"> Loading . . . </h2>

        <div v-else
          class="col col-lg-6 col-lg-push-3 col-md-8 col-md-push-2 col-xs-12
          text-center"
        >
          <div class="content">
            <!-- header -->
            <h1 class="title text-center form-group">
              Login
            </h1>

            <form>
              <div class="form-group">
                <div v-show="errors.email" class="input-error">
                  {{ errors.email }}
                </div>
                <input
                  type="email"
                  class="form-control"
                  name="email"
                  placeholder="Email Address"
                  v-model="email"
                  @keyup="validateEmail"
                />
              </div>

              <div class="form-group">
                <div v-show="errors.password" class="input-error">
                  {{ errors.password }}
                </div>
                <input
                  type="password"
                  class="form-control"
                  name="password"
                  placeholder="Password"
                  v-model="password"
                />
              </div>

              <div class="form-group">
                <button
                  :disabled="submitting"
                  type="submit"
                  class="btn btn-block btn-green"
                  @click.prevent="handleSubmit"
                >
                  <span v-show="!submitting">Login</span>
                  <span v-show="submitting">Submitting . . .</span>
                </button>
              </div>
            </form>

            <div class="row">
              <div class="col text-right float-right">
                <router-link :to="{ name: 'Password-Reset' }">
                  Forgot Password?
                </router-link>
              </div>
            </div>

            <div v-show="errors.login" class="login-error input-error">
              {{ errors.login }}
            </div>
          </div>

          <p>
            Don't have an account?
            <router-link :to="{ name: 'Signup' }">
              Sign Up
            </router-link>
          </p>

        </div>
      </div>
    </div>
  </section>
</template>

<script>
import NavAuthentication from '@/components/Nav-Authentication.vue';
import { mapActions } from 'vuex';
import * as validate from '@/utils/validation';
import { debounce } from 'lodash';

export default {
  name: 'login',

  components: { NavAuthentication },

  data () {
    return {
      submitting: false,
      email: '',
      password: '',
      attemptLogin: true,
      errors: {
        email: '',
        password: '',
        login: ''
      }
    };
  },

  created () {
    this.attemptLogin = false;
  },

  methods: {
    ...mapActions([ 'login' ]),

    handleSubmit () {
      if (!this.validateInputs()) return;

      this.submitting = true;

      const credentials = {
        email: this.email,
        password: this.password
      };

      this.login(credentials)
        .then(() => this.$router.push('/dashboard'))
        .catch((err) => this.handleError(err));
    },

    clearError () {
      setTimeout(() => {
        this.errors.email = '';
        this.errors.password = '';
      }, 2000);
    },

    handleError (err) {
      this.submitting = false;
      this.attemptLogin = false;
      this.errors.login = err.message;
    },

    validateEmail: debounce(function () {
      const emailErrors = validate.email(this.email) || validate.required(this.email);
      this.errors.email = emailErrors;

      this.clearError();
    }, 400),

    validateInputs () {
      this.errors.email = validate.email(this.email) || validate.required(this.email);
      this.errors.password = validate.required(this.password);

      if (this.errors.email || this.errors.password) {
        this.clearError();
        return false;
      }

      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
.auth .content {
  padding: 2em 3em;
}

.auth .forgot-password {
  display: block;
  margin-top: 8px;
}

.auth .password .title {
  margin-bottom: 0.6em;
}

.auth .password .content p {
  margin-bottom: 2.5em;
}

.auth .checkbox label {
  padding-left: 24px;
}

.input-error {
  color: darkred;
  margin: 10px;
}
</style>
