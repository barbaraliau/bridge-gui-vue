<template lang="html">
  <div
    class="alert alert-info text-center"
    role="alert"
    data-alert-cookie="alert_new_partner_referraluser"
  >
    <span>
      <p><strong>
        You've been referred by {{ referralPartner | capitalize }}!
      </strong></p>
      <p>
        Sign up now to unlock <b>one year of free
        service</b> — up to 25GB of storage and bandwidth
        every month!
      </p>
    </span>
  </div>
</template>

<script>
export default {
  name: 'new-referral-partner-user-banner',

  props: {
    referralPartner: {
      type: String
    }
  }
};
</script>
