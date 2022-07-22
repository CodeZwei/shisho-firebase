<script lang="ts">
    import { initAuth } from './auth';
  
    const { loginWithGoogle, logout, user } = initAuth();
  </script>
  
  <div class="wrapper">
    {#if $user}
      <div class="w-full max-w-xs">
        <div class="text-center">
          <h2>{$user.email}</h2>
          <button type="button" class="mt-3" on:click={logout}>Logout</button>
        </div>
      </div>
    {:else}
      <div class="w-full max-w-xs">
        <form
          class="px-8 pt-6 pb-8 bg-white shadow-md"
        >
          <div class="mt-3">
            <button type="button" on:click|preventDefault={loginWithGoogle}>
              Sign In with Google
            </button>
          </div>
        </form>
      </div>
    {/if}
  </div>