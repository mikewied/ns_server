% Licensed under the Apache License, Version 2.0 (the "License"); you may not
% use this file except in compliance with the License. You may obtain a copy of
% the License at
%
%   http://www.apache.org/licenses/LICENSE-2.0
%
% Unless required by applicable law or agreed to in writing, software
% distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
% WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
% License for the specific language governing permissions and limitations under
% the License.

-module(query_api_wrap).

% This module wraps the native erlang API, and allows for performing
% operations on a remote vs. local databases via the same API.
%
% Notes:
% Many options and apis aren't yet supported here, they are added as needed.

-include("couch_db.hrl").
-include("couch_api_wrap.hrl").
-include("ns_common.hrl").

-export([
    send_n1ql_statement/1
    ]).

-import(couch_api_wrap_httpc, [
    send_req/3
    ]).


send_n1ql_statement(Req) ->
%send_n1ql_statement(#httpdb{} = Db, Req, Options) ->
    %Is a 30 second timeout reasonable?
    Params = Req:parse_post(),
    Query = proplists:get_value("query", Params),
    Node = proplists:get_value("node", Params),

    Db_ = #httpdb{url=Node,
                 headers=[
                    {"Content-Type", "text/plain"},
                    {"User-Agent", "NS_Server Proxy"},
                    {"Accept-Encoding", "gzip"}],
                 timeout=30000
                },

    % Don't set up a connection pool every time
    {_, DB} = couch_api_wrap_httpc:setup(Db_),
    send_req(
        DB,
        [{path, "/query"},
         {method, "POST"},
         {body, Query}],
        fun(ErrCode, _, Body)->
            {ok, ErrCode, Body}
        end).

