<script>
  // Fix the import
  import { page } from '$app/stores';
  
  export let user = null;

  // Define navigation items
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Avalúos', path: '/avaluos' }
  ];

  // Function to check if a path is active
  function isActive(path) {
    // Use the correct $page store
    return $page.url.pathname === path;
  }

  function handleLogout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  }
</script>

<nav class="bg-white shadow-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center">
          <img src="/images/logo.png" alt="Avalúos Trochez Logo" class="h-10 w-auto" />
          <span class="ml-2 text-lg font-semibold text-gray-800">Avalúos Trochez</span>
        </div>
        
        <!-- Navigation -->
        <div class="hidden md:ml-6 md:flex md:space-x-4">
          {#each navItems as item}
            <a 
              href={item.path} 
              class="px-3 py-2 rounded-md text-sm font-medium {isActive(item.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              {item.name}
            </a>
          {/each}
        </div>
      </div>
      
      <div class="flex items-center">
        <!-- User info and logout -->
        <div class="flex items-center gap-4">
          <span class="text-gray-600">Bienvenido, {user?.name || 'Usuario'}</span>
          <button 
            on:click={handleLogout}
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile menu, show/hide based on menu state -->
  <div class="md:hidden">
    <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
      {#each navItems as item}
        <a 
          href={item.path} 
          class="block px-3 py-2 rounded-md text-base font-medium {isActive(item.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
        >
          {item.name}
        </a>
      {/each}
    </div>
  </div>
</nav>
