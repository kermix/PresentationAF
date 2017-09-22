using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PrezentacjaAF.Models.SlideViewModels
{
    public class CreateEditViewModel : Models.Slide
    {
        [Display(Name = "Photo")]
        public IFormFile PhotoFile { get; set; }
        [Display(Name = "Music")]
        public IFormFile MusicFile { get; set; }
    }
}
