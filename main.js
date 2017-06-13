/**
 * Created by Piotr on 2017-03-29.
 */
$(document).ready( function() {
    let contributorsArr =[];
    let url = 'https://api.github.com/repos/angular/angular/contributors?client_id=bc5023d1f53e84b5a838&client_secret=709d05d3cec326a7ebe3d36791eeb5c8efa695d2';
    let usersArr = [];
    fetch( url ).then( response => response.json())
        .then( data => {
            let auth = '?client_id=bc5023d1f53e84b5a838&client_secret=709d05d3cec326a7ebe3d36791eeb5c8efa695d2';
            contributorsArr = data.map(item=>{
                let contributions = item.contributions;
                let id = item.id;
                return {id, contributions};
            });
            const userUrls = data.map( item => item.url + auth );
            const users = userUrls.map( userUrl => fetch( userUrl ));
            return Promise.all( users );

        }).then( responses => {
        return Promise.all( responses.map( user => user.json()));

    }).then( users => {

        contributorsArr.forEach( ( obj1 ) => {
            users.forEach( ( obj ) => {
                if ( obj1.id === obj.id ) {
                    Object.assign( obj, obj1 );
                }
            });
            return users;
        });
        usersArr.push(users);

        /*building the html for users*/
        $.each( users,  ( index, user ) => {

            $('#users').append(`
                    <div  class="panel panel-default userPanel">
                        <div class="panel-heading">
                            <h1 class="panel-title"><strong>${user.name ? user.name : user.login}</strong></h1>
                        </div>
                          <div class="panel-body">
                            <div class="row">
                                <div class="col-md-3 ">
                                    <img class="thumbnail avatar" src="${user.avatar_url}" alt="avatar">
                                    <a target="_blank" class="btn btn-primary btn-block" href="${user.html_url}">View Profile on GitHub</a>
                                    
                                </div>
                                
                                <div class="col-md-9">
                                    <span class="label label-default ">Public Repos:<span class="repos"> ${user.public_repos}</span> </span>
                                    <span class="label label-primary">Public Gists:<span class="gists"> ${user.public_gists}</span></span>
                                    <span class="label label-success">Contributions:<span class="contributions"> ${user.contributions}</span></span>
                                    <span class="label label-info">Followers:<span class="followers"> ${user.followers}</span></span>
                                    <br><br>
                                    <ul class="list-group">
                                        <li class="list-group-item">Login: <span class="login">${ user.login }</span></li> 
                                        <li class="list-group-item">Company:<span> ${ user.company ? user.company : 'freelancer' }</span></li>
                                        <li class="list-group-item">Location:<span> ${ user.location ? user.location : 'location not available' }</span></li>
                                        <li class="list-group-item">Member Since:<span> ${ user.created_at }</span></li>
                                    </ul>
                                    <h4 class="page-header">Click to see latest Repos </h4>
                                </div>
                            </div>
                          </div>
                          
                        </div>          
                       <div class="repositories"></div>
                    `);

        });

    });
    /*sorting methods*/
    function sortByGists( x, y ){
        let a = $( x ).find('div.col-md-9 span span.gists').text();
        let b = $( y ).find('div.col-md-9 span span.gists').text();
        return  parseInt( b ) - parseInt( a );
    }
    function sortByRepos( x, y ){
        let a = $( x ).find('div.col-md-9 span span.repos').text();
        let b = $( y ).find('div.col-md-9 span span.repos').text();
        return  parseInt( b ) - parseInt( a );
    }
    function sortByContributions( x, y ){
        let a = $( x ).find('div.col-md-9 span span.contributions').text();
        let b = $( y ).find('div.col-md-9 span span.contributions').text();
        return  parseInt( b ) - parseInt( a );
    }
    function sortByFollowers( x, y ){
        let a = $( x ).find('div.col-md-9 span span.followers').text();
        let b = $( y ).find('div.col-md-9 span span.followers').text();
        return  parseInt( b ) - parseInt( a );
    }

    function reorderEl( el ){
        let container = $( '#users' );
        container.html('');
        el.each( function(){
            $( this ).appendTo( container );
        });
    }
    $('#gists').click(function(){
        reorderEl($('.userPanel').sort( sortByGists ));
    });
    $('#repos').click(function(){
        reorderEl($('.userPanel').sort( sortByRepos ));
    });
    $('#contributions').click( function(){
        reorderEl($('.userPanel').sort( sortByContributions ));
    });
    $('#followers').click(function(){
        reorderEl($('.userPanel').sort( sortByFollowers ));
    });

    $('#users').on( 'click', '.userPanel', function ( user ) {
        let login = $( this ).find( 'div.col-md-9  span.login' ).text();
        let auth = '?client_id=bc5023d1f53e84b5a838&client_secret=709d05d3cec326a7ebe3d36791eeb5c8efa695d2';
        let $div = $( this ).closest("div.userPanel");
        $('<button>Close Repos</button>').addClass("btn btn-primary ").insertAfter($div);

        $.ajax({
            url:'https://api.github.com/users/'+login+'/repos'+auth,
            data:{
                sort:'created: asc'
            }
        }).done(function ( repos ) {
            $.each( repos, function ( index, repo ) {

                $('<div>').addClass('well').append(`
                  <div class="row">
                    <div class="col-md-7">
                        <strong>${repo.name}</strong>: ${repo.description ? repo.description : 'description not provided' }
                    </div>
                    <div class="col-md-3">
                        <span class="label label-default ">Forks:<span class="repos"> ${repo.forks_count}</span> </span>
                        <span class="label label-primary">Watchers:<span class="gists"> ${repo.watchers_count}</span></span>
                        <span class="label label-success">Stars:<span class="contributions"> ${repo.stargazers_count}</span></span>
                    </div>
                    <div class="col-md-2"></div>
                        <a href="${repo.html_url}" class="btn btn-default" target="_blank">Repo Page</a>
                  </div>
                    `).insertAfter( 'button.btn' )
            });

        });

    });
    $( '#users' ).on('click', 'button.btn', function(){
        $( '.well' ).remove();
        $( 'button.btn' ).remove();
    });
});
