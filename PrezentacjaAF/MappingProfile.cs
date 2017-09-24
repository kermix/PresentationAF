using AutoMapper;
using PrezentacjaAF.Models;
using PrezentacjaAF.Models.SlideViewModels;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Slide, CreateEditViewModel>();
        CreateMap<CreateEditViewModel, Slide>();
        CreateMap<Slide, DeleteViewModel>();
        CreateMap<DeleteViewModel, Slide>();
        CreateMap<Slide, IndexViewModel>();
        CreateMap<IndexViewModel, Slide>();
    }
}