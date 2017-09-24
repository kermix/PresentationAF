using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PrezentacjaAF.Data;
using PrezentacjaAF.Models;
using PrezentacjaAF.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using AutoMapper;
using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;

namespace PrezentacjaAF
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            Configuration = configuration;
            if (!System.IO.Directory.Exists(env.WebRootPath + @"\uploads\photos\"))
                System.IO.Directory.CreateDirectory(env.WebRootPath + @"\uploads\photos\");
            if (!System.IO.Directory.Exists(env.WebRootPath + @"\uploads\photos\thumbs\"))
                System.IO.Directory.CreateDirectory(env.WebRootPath + @"\uploads\photos\thumbs\");
            if (!System.IO.Directory.Exists(env.WebRootPath + @"\uploads\music"))
                System.IO.Directory.CreateDirectory(env.WebRootPath + @"\uploads\music\");
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services.AddLocalization(options => options.ResourcesPath = "Resources");
            var supportedCultures = new CultureInfo[]
            {
                new CultureInfo("pl-PL"),
            };

            services.Configure<RequestLocalizationOptions>(s =>
            {
                s.SupportedCultures = supportedCultures;
                s.SupportedUICultures = supportedCultures;
                s.DefaultRequestCulture = new RequestCulture(culture: "pl-PL", uiCulture: "pl-PL");
            });

            // Add application services.
            services.AddAutoMapper(typeof(Startup));
            services.AddMvc()
                .AddViewLocalization(Microsoft.AspNetCore.Mvc.Razor.LanguageViewLocationExpanderFormat.Suffix)
                .AddDataAnnotationsLocalization();
            services.AddTransient<IEmailSender, EmailSender>();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }


            var locOptions = app.ApplicationServices.GetService<IOptions<RequestLocalizationOptions>>();
            app.UseRequestLocalization(locOptions.Value);

            app.UseStaticFiles();

            app.UseAuthentication();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
