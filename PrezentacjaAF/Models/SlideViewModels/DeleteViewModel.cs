using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PrezentacjaAF.Models.SlideViewModels
{
    public class DeleteViewModel
    {
        public int ID { get; set; }
        [Display(Name = "Title")]
        public string Title { get; set; }
    }
}
